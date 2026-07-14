process.env.TZ = 'Africa/Cairo';
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const http = require('node:http');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('node:path').resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Department = require('../models/Department');
const BlockTime = require('../models/BlockTime');
const { signAccess } = require('../utils/jwt');
const app = require('../app');

let dept, doctor, patient, server, doctorToken, patientToken;

// Helper to make POST requests
function httpPost(server, path, token, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = JSON.stringify(body);
    const options = {
      host: '127.0.0.1',
      port: addr.port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(token ? { Cookie: `accessToken=${token}` } : {}),
      },
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
    req.write(payload);
    req.end();
  });
}

// Helper to make GET requests
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

// Helper to make DELETE requests
function httpDelete(server, path, token) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      host: '127.0.0.1',
      port: addr.port,
      path,
      method: 'DELETE',
      headers: token ? { Cookie: `accessToken=${token}` } : {},
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 2 });

  // Clean up any stale test records from previous failed runs
  await BlockTime.deleteMany({});
  await User.deleteMany({ email: /blocktime-test/ });
  await Department.deleteMany({ name: /blocktime-test/ });

  dept = await Department.create({ name: 'blocktime-test-dept' });

  doctor = new User({
    email: 'blocktime-test-doctor@test.com',
    passwordHash: 'ValidPass12!',
    name: 'BlockTime Test Doctor',
    role: 'doctor',
    departmentId: dept._id,
  });
  await doctor.save();

  patient = new User({
    email: 'blocktime-test-patient@test.com',
    passwordHash: 'ValidPass12!',
    name: 'BlockTime Test Patient',
    role: 'patient',
  });
  await patient.save();

  doctorToken = signAccess({ userId: doctor._id.toString(), role: doctor.role });
  patientToken = signAccess({ userId: patient._id.toString(), role: patient.role });

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (doctor) {
    await BlockTime.deleteMany({ doctorId: doctor._id });
  }
  await User.deleteMany({ email: /blocktime-test/ });
  await Department.deleteMany({ name: /blocktime-test/ });
  await mongoose.disconnect();
});

test('Doctor can create, list, and delete a block time, which affects availability', async () => {
  // 1. Initially, let's check slots for today
  const dateStr = '2026-07-15';
  const getRes1 = await httpGet(server, `/api/v1/appointments/availability?doctorId=${doctor._id}&date=${dateStr}`, patientToken);
  assert.equal(getRes1.status, 200);
  const initialSlotCount = getRes1.body.slots.length;
  // Standard 9am to 5pm in 30-min slots is 16 slots
  assert.equal(initialSlotCount, 16);

  // 2. Doctor creates a block time from 10:00 to 11:30 (should block 10:00, 10:30, 11:00 slots)
  const blockData = {
    date: dateStr,
    startTime: '10:00',
    endTime: '11:30',
    reason: 'Ward rounds',
  };

  const createRes = await httpPost(server, '/api/v1/block-times', doctorToken, blockData);
  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.reason, 'Ward rounds');
  assert.ok(createRes.body._id);
  const blockId = createRes.body._id;

  // 3. Doctor lists block times
  const listRes = await httpGet(server, '/api/v1/block-times', doctorToken);
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.length, 1);
  assert.equal(listRes.body[0].reason, 'Ward rounds');

  // 4. Patient gets availability again. The 10:00, 10:30, and 11:00 slots should be removed.
  const getRes2 = await httpGet(server, `/api/v1/appointments/availability?doctorId=${doctor._id}&date=${dateStr}`, patientToken);
  assert.equal(getRes2.status, 200);
  const blockedSlotCount = getRes2.body.slots.length;
  assert.equal(blockedSlotCount, 13); // 16 - 3 slots blocked

  // Ensure those specific slots are missing in local time
  const slots = getRes2.body.slots.map(s => {
    const d = new Date(s);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });
  assert.ok(!slots.includes('10:00'));
  assert.ok(!slots.includes('10:30'));
  assert.ok(!slots.includes('11:00'));
  assert.ok(slots.includes('09:30'));
  assert.ok(slots.includes('11:30'));

  // 5. Doctor deletes the block time
  const deleteRes = await httpDelete(server, `/api/v1/block-times/${blockId}`, doctorToken);
  assert.equal(deleteRes.status, 204);

  // 6. List block times should be empty
  const listRes2 = await httpGet(server, '/api/v1/block-times', doctorToken);
  assert.equal(listRes2.status, 200);
  assert.equal(listRes2.body.length, 0);

  // 7. Slots should be back to 16
  const getRes3 = await httpGet(server, `/api/v1/appointments/availability?doctorId=${doctor._id}&date=${dateStr}`, patientToken);
  assert.equal(getRes3.status, 200);
  assert.equal(getRes3.body.slots.length, 16);
});

test('Patient cannot view or manage block times directly', async () => {
  const listRes = await httpGet(server, '/api/v1/block-times', patientToken);
  assert.equal(listRes.status, 403);

  const createRes = await httpPost(server, '/api/v1/block-times', patientToken, {
    date: '2026-07-15',
    startTime: '10:00',
    endTime: '11:30',
    reason: 'Hijack',
  });
  assert.equal(createRes.status, 403);
});
