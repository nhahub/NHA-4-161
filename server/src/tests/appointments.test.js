/**
 * Integration tests — appointment authorization guards + receptionist staff access.
 *
 * Covers:
 *   1. Patient submitting 'attended' on their OWN appointment → 403
 *   2. Patient submitting 'no-show' on their OWN appointment → 403
 *   3. Patient submitting 'attended' on ANOTHER patient's appointment → 403
 *      (this is the exact bypass: the old guard only ran the ownership check
 *      when status === 'cancelled', so any other status on any appointment
 *      skipped the guard entirely)
 *   4. Patient cancelling ANOTHER patient's appointment → 403, DB unchanged
 *   5. Patient cancelling their OWN appointment → 200
 *   6. Receptionist calling GET /api/v1/staff?role=patient through the full
 *      HTTP stack (authenticate → listRules → list) returns 200 with users array.
 *      This is the actual endpoint AppointmentModal hits. Testing at the service
 *      layer alone does not catch a 400 from express-validator or a 403 from
 *      authorize() if one were added.
 *
 * Requires a running MongoDB replica set (docker-compose up -d).
 * Run with:  node --test server/src/tests/appointments.test.js
 */
process.env.TZ = 'Africa/Cairo';
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const http = require('node:http');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('node:path').resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const { updateStatus } = require('../controllers/appointmentController');
const { signAccess } = require('../utils/jwt');
const app = require('../app');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal req/res/next triple for controller unit testing. */
function mockHttp({ userId, role, paramId, bodyStatus }) {
  const req = {
    user: { userId, role },
    params: { id: paramId },
    body: { status: bodyStatus },
  };
  const res = {
    _status: null,
    _body: null,
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
  };
  const next = (err) => { res._status = err?.status ?? 500; res._body = { error: err?.message }; };
  return { req, res, next };
}

/**
 * Fire a real HTTP GET against the Express app without supertest.
 * Returns { status, body } where body is the parsed JSON response.
 */
function httpGet(server, path, token) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      host: '127.0.0.1',
      port: addr.port,
      path,
      method: 'GET',
      headers: token ? { Cookie: `accessToken=${token}` } : {},
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── Shared fixtures ───────────────────────────────────────────────────────────

let dept, doctor, patientA, patientB, receptionist, apptForA, server;

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 2 });

  dept = await Department.create({ name: 'appt-auth-test-dept' });

  doctor = new User({
    email: 'appt-auth-test-doctor@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Auth Test Doctor',
    role: 'doctor',
    departmentId: dept._id,
  });
  await doctor.save();

  patientA = new User({
    email: 'appt-auth-test-patientA@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Patient A',
    role: 'patient',
  });
  await patientA.save();

  patientB = new User({
    email: 'appt-auth-test-patientB@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Patient B',
    role: 'patient',
  });
  await patientB.save();

  receptionist = new User({
    email: 'appt-auth-test-receptionist@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Auth Test Receptionist',
    role: 'receptionist',
  });
  await receptionist.save();

  apptForA = await Appointment.create({
    patientId: patientA._id,
    doctorId: doctor._id,
    departmentId: dept._id,
    dateTime: new Date(Date.now() + 86_400_000),
    status: 'scheduled',
  });

  // Start a real HTTP server on a random port for the HTTP-layer tests
  server = app.listen(0);
});

after(async () => {
  server.close();
  await Appointment.deleteMany({ _id: { $in: [apptForA._id] } });
  await User.deleteMany({ email: /appt-auth-test/ });
  await Department.deleteMany({ name: /appt-auth-test/ });
  await mongoose.disconnect();
});

// ── Controller-layer security tests ──────────────────────────────────────────

test('patient submitting status "attended" on their own appointment gets 403', async () => {
  const { req, res, next } = mockHttp({
    userId: patientA._id.toString(),
    role: 'patient',
    paramId: apptForA._id.toString(),
    bodyStatus: 'attended',
  });

  await updateStatus(req, res, next);

  assert.equal(res._status, 403, 'Patients may not set attended — even on their own appointment');
});

test('patient submitting status "no-show" on their own appointment gets 403', async () => {
  const { req, res, next } = mockHttp({
    userId: patientA._id.toString(),
    role: 'patient',
    paramId: apptForA._id.toString(),
    bodyStatus: 'no-show',
  });

  await updateStatus(req, res, next);

  assert.equal(res._status, 403, 'Patients may not set no-show — even on their own appointment');
});

test('patient submitting status "attended" on ANOTHER patient\'s appointment gets 403', async () => {
  // This is the critical bypass case: the old guard only engaged for status === 'cancelled'.
  // With any other status (attended, no-show, scheduled) as patientB against patientA's
  // appointment, the original code fell through to apptService.updateStatus with no check.
  const { req, res, next } = mockHttp({
    userId: patientB._id.toString(), // patientB — does NOT own apptForA
    role: 'patient',
    paramId: apptForA._id.toString(),
    bodyStatus: 'attended',
  });

  await updateStatus(req, res, next);

  assert.equal(res._status, 403, 'Must 403 — non-cancel status on someone else\'s appointment bypassed the old guard');

  // Confirm no mutation occurred
  const unchanged = await Appointment.findById(apptForA._id);
  assert.equal(unchanged.status, 'scheduled', 'Appointment status must be untouched');
});

test('patient cancelling another patient\'s appointment gets 403', async () => {
  const { req, res, next } = mockHttp({
    userId: patientB._id.toString(),
    role: 'patient',
    paramId: apptForA._id.toString(),
    bodyStatus: 'cancelled',
  });

  await updateStatus(req, res, next);

  assert.equal(res._status, 403, 'Cannot cancel another patient\'s appointment');

  const unchanged = await Appointment.findById(apptForA._id);
  assert.equal(unchanged.status, 'scheduled', 'Appointment status must be untouched');
});

test('patient cancelling their own appointment succeeds', async () => {
  const { req, res, next } = mockHttp({
    userId: patientA._id.toString(),
    role: 'patient',
    paramId: apptForA._id.toString(),
    bodyStatus: 'cancelled',
  });

  await updateStatus(req, res, next);

  assert.equal(res._status, null, 'Should not set an error status');
  assert.equal(res._body?.status, 'cancelled', 'Appointment should now be cancelled');
});

// ── HTTP-layer: receptionist staff access ─────────────────────────────────────

test('receptionist GET /api/v1/staff?role=patient returns 200 through full HTTP stack', async () => {
  // Sign a real JWT as the receptionist — this exercises authenticate() middleware,
  // listRules express-validator (which previously rejected 'patient' as an invalid enum),
  // and the list handler. Testing at the service layer alone misses all of that.
  const token = signAccess({
    userId: receptionist._id.toString(),
    role: 'receptionist',
  });

  const { status, body } = await httpGet(server, '/api/v1/staff?role=patient', token);

  assert.equal(status, 200, `Expected 200 from /staff?role=patient as receptionist, got ${status}`);
  assert.ok(Array.isArray(body.users), 'Response must include a users array');

  const emails = body.users.map((u) => u.email);
  assert.ok(
    emails.includes('appt-auth-test-patienta@test.com'),
    'patientA must appear in the patient list'
  );
  assert.ok(
    emails.includes('appt-auth-test-patientb@test.com'),
    'patientB must appear in the patient list'
  );
});
