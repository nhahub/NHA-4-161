/**
 * Integration test — cascade transaction correctness.
 *
 * Requires a running MongoDB replica set (docker-compose up -d).
 * Run with:  node --test server/src/tests/cascade.test.js
 */
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('node:path').resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const { deactivateUser } = require('../services/staffService');
const { reassignHead } = require('../services/departmentService');

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 2 });
});

after(async () => {
  // Clean up test documents only
  await User.deleteMany({ email: /cascade-test/ });
  await Department.deleteMany({ name: /cascade-test/ });
  await Appointment.deleteMany({ _id: { $in: [] } }); // cleared per-test
  await mongoose.disconnect();
});

test('successful cascade: deactivates doctor and cancels future appointments', async () => {
  const dept = await Department.create({ name: 'cascade-test-dept' });

  const doctor = new User({
    email: 'cascade-test-doctor@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Test Doctor',
    role: 'doctor',
    departmentId: dept._id,
  });
  await doctor.save();

  const patient = new User({
    email: 'cascade-test-patient@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Test Patient',
    role: 'patient',
  });
  await patient.save();

  const futureDate = new Date(Date.now() + 86_400_000); // tomorrow
  const pastDate = new Date(Date.now() - 86_400_000);   // yesterday

  const [futureAppt, pastAppt] = await Appointment.insertMany([
    { patientId: patient._id, doctorId: doctor._id, departmentId: dept._id, dateTime: futureDate, status: 'scheduled' },
    { patientId: patient._id, doctorId: doctor._id, departmentId: dept._id, dateTime: pastDate,  status: 'scheduled' },
  ]);

  const result = await deactivateUser(doctor._id.toString());

  assert.equal(result.cancelledAppointments, 1, 'Only the future appointment should be cancelled');

  const updatedDoctor = await User.findById(doctor._id);
  assert.equal(updatedDoctor.isActive, false, 'Doctor should be inactive');
  assert.ok(updatedDoctor.deletedAt, 'deletedAt should be set');
  assert.equal(updatedDoctor.departmentId, null, 'departmentId should be cleared');
  assert.equal(updatedDoctor.refreshTokenId, null, 'session should be revoked');

  const updatedFuture = await Appointment.findById(futureAppt._id);
  assert.equal(updatedFuture.status, 'cancelled', 'Future appointment should be cancelled');

  const updatedPast = await Appointment.findById(pastAppt._id);
  assert.equal(updatedPast.status, 'scheduled', 'Past appointment should NOT be touched');

  // Cleanup
  await Appointment.deleteMany({ _id: { $in: [futureAppt._id, pastAppt._id] } });
});

test('deactivating a non-existent user throws 404', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  await assert.rejects(
    () => deactivateUser(fakeId.toString()),
    (err) => {
      assert.equal(err.status, 404);
      return true;
    }
  );
});

test('reassignHead fails when target user is not a doctor', async () => {
  const dept = await Department.create({ name: 'cascade-test-dept-2' });

  const patient = new User({
    email: 'cascade-test-non-doctor@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Test Patient',
    role: 'patient',
  });
  await patient.save();

  await assert.rejects(
    () => reassignHead(dept._id.toString(), patient._id.toString()),
    (err) => {
      assert.equal(err.status, 400);
      assert.match(err.message, /not an active doctor/i);
      return true;
    }
  );

  // Reassign to null/none should succeed
  const updatedDept = await reassignHead(dept._id.toString(), null);
  assert.equal(updatedDept.headUserId, null);

  // Cleanup
  await Department.deleteOne({ _id: dept._id });
  await User.deleteOne({ _id: patient._id });
});
