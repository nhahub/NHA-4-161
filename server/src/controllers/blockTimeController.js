const { body, param, query, validationResult } = require('express-validator');
const blockTimeService = require('../services/blockTimeService');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createRules = [
  body('date').isISO8601().toDate(),
  body('startTime').matches(TIME_REGEX).withMessage('startTime must be HH:mm'),
  body('endTime').matches(TIME_REGEX).withMessage('endTime must be HH:mm'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
];

const listRules = [
  query('date').optional().isISO8601().toDate(),
];

const removeRules = [
  param('id').isMongoId(),
];

async function list(req, res, next) {
  try {
    // Doctors only see their own blocks; admins see everything
    // (mirrors appointmentController's list scoping).
    const scope = req.user.role === 'doctor' ? { doctorId: req.user.userId } : {};
    const blocks = await blockTimeService.listBlocks({ ...scope, ...req.query });
    res.json(blocks);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    // doctorId always comes from the authenticated user, never the body —
    // a doctor can only ever block their own calendar.
    const block = await blockTimeService.createBlock({ ...req.body, doctorId: req.user.userId });
    res.status(201).json(block);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await blockTimeService.removeBlock(req.params.id, req.user);
    res.json({ message: 'Block removed' });
  } catch (err) { next(err); }
}

module.exports = { createRules, listRules, removeRules, validate, list, create, remove };
