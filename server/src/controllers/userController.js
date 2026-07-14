const { body, param, query, validationResult } = require('express-validator');
const staffService = require('../services/staffService');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// ── Validation rule sets ───────────────────────────────────────────

const createRules = [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 12 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be ≥12 chars with upper, lower, and digit'),
  body('name').trim().notEmpty(),
  body('role').isIn(['admin', 'doctor', 'receptionist']),
  body('departmentId').optional().isMongoId(),
];

const updateRules = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('role').optional().isIn(['admin', 'doctor', 'receptionist', 'patient']),
  body('departmentId').optional().isMongoId(),
  body('password')
    .optional()
    .isLength({ min: 12 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be ≥12 chars with upper, lower, and digit'),
];

const listRules = [
  query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
  query('skip').optional().isInt({ min: 0 }).toInt(),
  query('role').optional().isIn(['admin', 'doctor', 'receptionist', 'patient']),
];

// ── Handlers ──────────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const result = await staffService.listUsers(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const user = await staffService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const user = await staffService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await staffService.deactivateUser(req.params.id);
    res.json(result); // { cancelledAppointments: n }
  } catch (err) { next(err); }
}

module.exports = { createRules, updateRules, listRules, validate, list, create, update, remove };
