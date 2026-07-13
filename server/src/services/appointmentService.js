const Appointment = require('../models/Appointment');

/**
 * Create an appointment. Status defaults to 'scheduled'.
 * No double-booking check — out of scope per tasks.md.
 */
async function createAppointment({ patientId, doctorId, departmentId, dateTime }) {
  const appt = await Appointment.create({ patientId, doctorId, departmentId, dateTime });
  return appt;
}

/**
 * Update appointment status only.
 * Doctors can only update their own appointments (enforced in controller).
 */
async function updateStatus(apptId, status) {
  const appt = await Appointment.findOneAndUpdate(
    { _id: apptId, isActive: true },
    { status },
    { new: true }
  );
  if (!appt) {
    const err = new Error('Appointment not found');
    err.status = 404;
    throw err;
  }
  return appt;
}

/**
 * List appointments.
 * scope = { doctorId } limits to that doctor's own appointments.
 * Admins pass no scope and see everything.
 */
async function listAppointments({ patientId, doctorId, limit = 50, skip = 0 } = {}) {
  const filter = { isActive: true };
  if (patientId) filter.patientId = patientId;
  if (doctorId) filter.doctorId = doctorId;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .populate('departmentId', 'name')
      .sort({ dateTime: -1 })
      .skip(Number(skip))
      .limit(Number(limit)),
    Appointment.countDocuments(filter),
  ]);
  return { appointments, total };
}

module.exports = { createAppointment, updateStatus, listAppointments };
