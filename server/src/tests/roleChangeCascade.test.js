/**
 * Integration test — role change cascade transaction correctness.
 *
 * Requires a running MongoDB replica set (docker-compose up -d).
 * Run with:  node --test server/src/tests/roleChangeCascade.test.js
 */
process.env.TZ = 'Africa/Cairo';
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('node:path').resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const { updateUser } = require('../services/staffService');

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 2 });
});

after(async () => {
  // Clean up test documents only
  await User.deleteMany({ email: /role-change-test/ });
  await Department.deleteMany({ name: /role-change-test/ });
  await mongoose.disconnect();
});

test('successful role change cascade: cancels future appointments and unassigns head', async () => {
  const dept = await Department.create({ name: 'role-change-test-dept' });

  const doctor = new User({
    email: 'role-change-test-doctor@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Test Doctor',
    role: 'doctor',
    departmentId: dept._id,
  });
  await doctor.save();

  // Assign doctor as department head
  dept.headUserId = doctor._id;
  await dept.save();

  const patient = new User({
    email: 'role-change-test-patient@test.com',
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

  // Update role away from doctor
  const result = await updateUser(doctor._id.toString(), { role: 'receptionist' });

  assert.equal(result.role, 'receptionist', 'Role should be updated to receptionist');

  // Verify future appointment is cancelled
  const updatedFuture = await Appointment.findById(futureAppt._id);
  assert.equal(updatedFuture.status, 'cancelled', 'Future appointment should be cancelled');

  // Verify past appointment is untouched
  const updatedPast = await Appointment.findById(pastAppt._id);
  assert.equal(updatedPast.status, 'scheduled', 'Past appointment should NOT be touched');

  // Verify department head is unassigned
  const updatedDept = await Department.findById(dept._id);
  assert.equal(updatedDept.headUserId, null, 'Department head should be set to null');

  // Cleanup
  await Appointment.deleteMany({ _id: { $in: [futureAppt._id, pastAppt._id] } });
});

test('no role change does not cancel appointments or unassign head', async () => {
  const dept = await Department.create({ name: 'role-change-test-dept-2' });

  const doctor = new User({
    email: 'role-change-test-doctor2@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Test Doctor 2',
    role: 'doctor',
    departmentId: dept._id,
  });
  await doctor.save();

  dept.headUserId = doctor._id;
  await dept.save();

  const patient = new User({
    email: 'role-change-test-patient2@test.com',
    passwordHash: 'ValidPass12!',
    name: 'Test Patient 2',
    role: 'patient',
  });
  await patient.save();

  const futureDate = new Date(Date.now() + 86_400_000); // tomorrow
  const futureAppt = await Appointment.create({
    patientId: patient._id,
    doctorId: doctor._id,
    departmentId: dept._id,
    dateTime: futureDate,
    status: 'scheduled',
  });

  // Update name, no role change
  const result = await updateUser(doctor._id.toString(), { name: 'Updated Doctor Name' });

  assert.equal(result.name, 'Updated Doctor Name', 'Name should be updated');

  const updatedDocObj = await User.findById(doctor._id);
  assert.equal(updatedDocObj.role, 'doctor', 'Database role should still be doctor');

  // Verify future appointment is still scheduled
  const updatedFuture = await Appointment.findById(futureAppt._id);
  assert.equal(updatedFuture.status, 'scheduled', 'Future appointment should still be scheduled');

  // Verify department head is untouched
  const updatedDept = await Department.findById(dept._id);
  assert.equal(updatedDept.headUserId.toString(), doctor._id.toString(), 'Department head should still be the doctor');

  // Cleanup
  await Appointment.deleteOne({ _id: futureAppt._id });
});
