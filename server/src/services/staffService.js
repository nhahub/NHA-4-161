const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');

/**
 * Soft-delete a staff member inside a single Mongo transaction.
 * For doctors: cancels all their future scheduled appointments atomically.
 * Returns { cancelledAppointments: n } on commit.
 *
 * # ponytail: sync transaction only; move cascade to a queue if/when it starts
 * doing external I/O (email/SMS notifications on cancellation)
 */
async function deactivateUser(userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ _id: userId, isActive: true }).session(session);
    if (!user) {
      const err = new Error('Staff member not found');
      err.status = 404;
      throw err;
    }

    let cancelledAppointments = 0;
    if (user.role === 'doctor') {
      const result = await Appointment.updateMany(
        { doctorId: userId, status: 'scheduled', dateTime: { $gte: new Date() } },
        { status: 'cancelled' },
        { session }
      );
      cancelledAppointments = result.modifiedCount;
    }

    await User.updateOne(
      { _id: userId },
      { isActive: false, deletedAt: new Date(), departmentId: null, refreshTokenId: null },
      { session }
    );

    await session.commitTransaction();
    return { cancelledAppointments };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

/**
 * Create a staff member. passwordHash field receives the plaintext password
 * and User.pre('save') hashes it.
 */
async function createUser(data) {
  const user = new User({
    email: data.email,
    passwordHash: data.password, // pre('save') bcryptjs-hashes this
    name: data.name,
    role: data.role,
    departmentId: data.departmentId || null,
  });
  await user.save();
  return { _id: user._id, name: user.name, email: user.email, role: user.role, departmentId: user.departmentId };
}

/**
 * Update non-sensitive fields. Password change goes through the model hook.
 */
async function updateUser(userId, data) {
  const allowed = {};
  if (data.name) allowed.name = data.name;
  if (data.role) allowed.role = data.role;
  if (data.departmentId !== undefined) allowed.departmentId = data.departmentId || null;
  if (data.password) allowed.passwordHash = data.password; // triggers pre('save') hash

  if (Object.keys(allowed).length === 0) {
    const err = new Error('No valid fields to update');
    err.status = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ _id: userId, isActive: true }).session(session);
    if (!user) {
      const err = new Error('Staff member not found');
      err.status = 404;
      throw err;
    }

    // Detect role change: doctor -> non-doctor
    if (user.role === 'doctor' && allowed.role && allowed.role !== 'doctor') {
      const now = new Date();
      await Appointment.updateMany(
        { doctorId: userId, status: 'scheduled', dateTime: { $gte: now } },
        { status: 'cancelled' },
        { session }
      );
      await Department.updateMany(
        { headUserId: userId },
        { headUserId: null },
        { session }
      );
    }

    Object.assign(user, allowed);
    await user.save({ session });

    await session.commitTransaction();
    return { _id: user._id, name: user.name, email: user.email, role: user.role, departmentId: user.departmentId };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

/**
 * Paginated staff list (active only).
 */
async function listUsers({ limit = 20, skip = 0, role } = {}) {
  const filter = { isActive: true };
  if (role) filter.role = role;
  const [users, total] = await Promise.all([
    User.find(filter, 'name email role departmentId createdAt')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  return { users, total };
}

module.exports = { deactivateUser, createUser, updateUser, listUsers };
