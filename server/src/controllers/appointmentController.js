const { body, param, query, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const apptService = require('../services/appointmentService');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

const createRules = [
  body('doctorId').isMongoId(),
  body('dateTime').isISO8601().toDate(),
  // departmentId is derived server-side from the doctor; we don't validate it from the client
];

const updateRules = [
  param('id').isMongoId(),
  body('status').isIn(['scheduled', 'attended', 'no-show', 'cancelled']),
];

const listRules = [
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('skip').optional().isInt({ min: 0 }).toInt(),
];

const availabilityRules = [
  query('doctorId').isMongoId(),
  query('date').isDate({ format: 'YYYY-MM-DD' }),
];

async function list(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'patient') filter.patientId = req.user.userId;
    else if (req.user.role === 'doctor') filter.doctorId = req.user.userId;
    const result = await apptService.listAppointments({ ...filter, ...req.query });
    res.json(result);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { doctorId, dateTime } = req.body;

    // Verify doctorId refers to a real, active doctor and derive departmentId from them
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
    if (!doctor) {
      return res.status(400).json({ error: 'Doctor not found or inactive' });
    }

    // Enforce patientId — patients can only book for themselves
    const patientId = req.user.role === 'patient' ? req.user.userId : req.body.patientId;
    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: 'Invalid patientId' });
    }

    const patient = await User.findOne({ _id: patientId, role: 'patient', isActive: true });
    if (!patient) {
      return res.status(400).json({ error: 'Patient not found or inactive' });
    }

    const appt = await apptService.createAppointment({
      patientId,
      doctorId,
      departmentId: doctor.departmentId,
      dateTime,
    });
    res.status(201).json(appt);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    // Patients: may only cancel their own appointments
    if (req.user.role === 'patient') {
      if (req.body.status !== 'cancelled') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const appt = await Appointment.findById(req.params.id);
      if (!appt || appt.patientId?.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Doctors: may only update their own appointments
    if (req.user.role === 'doctor') {
      const appt = await Appointment.findById(req.params.id);
      if (!appt || appt.doctorId?.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const appt = await apptService.updateStatus(req.params.id, req.body.status);
    res.json(appt);
  } catch (err) { next(err); }
}

// Fixed 09:00–17:00, 30-min slots; subtract already-booked ones
async function getAvailability(req, res, next) {
  try {
    const { doctorId, date } = req.query;

    // Validate doctorId refers to a real, active doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
    if (!doctor) return res.status(400).json({ error: 'Doctor not found or inactive' });

    const base = new Date(`${date}T00:00:00`);
    if (isNaN(base)) return res.status(400).json({ error: 'Invalid date' });

    const nextDay = new Date(base);
    nextDay.setDate(nextDay.getDate() + 1);

    const allSlots = [];
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slot = new Date(base);
        slot.setHours(h, m, 0, 0);
        allSlots.push(slot.toISOString());
      }
    }

    const booked = await Appointment.find({
      doctorId,
      status: { $in: ['scheduled', 'attended'] },
      dateTime: { $gte: base, $lt: nextDay },
    }).select('dateTime');
    const bookedSet = new Set(booked.map((b) => b.dateTime.toISOString()));

    res.json({ slots: allSlots.filter((s) => !bookedSet.has(s)) });
  } catch (err) { next(err); }
}

module.exports = { createRules, updateRules, listRules, availabilityRules, validate, list, create, updateStatus, getAvailability };
