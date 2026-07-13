const BlockTime = require('../models/BlockTime');

/**
 * Create a block-time window for a doctor.
 * `doctorId` is always the authenticated doctor's own id (enforced in the
 * controller) — never trusted from the request body, so a doctor can't
 * block time on another doctor's calendar.
 */
async function createBlock({ doctorId, date, startTime, endTime, reason }) {
  const block = await BlockTime.create({ doctorId, date, startTime, endTime, reason });
  return block;
}

/**
 * List a doctor's active blocks, optionally filtered to one date.
 * scope = { doctorId } limits to that doctor's own blocks.
 * Admins pass no scope and see everything (mirrors listAppointments).
 */
async function listBlocks({ doctorId, date } = {}) {
  const filter = { isActive: true };
  if (doctorId) filter.doctorId = doctorId;
  if (date) filter.date = date;

  return BlockTime.find(filter)
    .populate('doctorId', 'name email')
    .sort({ date: 1, startTime: 1 });
}

/**
 * Soft-delete a block. Doctors may only remove their own blocks; admins
 * may remove any. Ownership check happens here (not just the controller)
 * so the guarantee holds even if this service is called from elsewhere.
 */
async function removeBlock(blockId, requestingUser) {
  const block = await BlockTime.findOne({ _id: blockId, isActive: true });
  if (!block) {
    const err = new Error('Block not found');
    err.status = 404;
    throw err;
  }

  const isOwner = block.doctorId.toString() === requestingUser.userId;
  if (requestingUser.role !== 'admin' && !isOwner) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  block.isActive = false;
  block.deletedAt = new Date();
  await block.save();
}

module.exports = { createBlock, listBlocks, removeBlock };
