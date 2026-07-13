const { body, validationResult } = require('express-validator');
const { parsePhoneNumberFromString } = require('libphonenumber-js/max');
const authService = require('../services/authService');
const User = require('../models/User');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const registerRules = [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 12 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be ≥12 chars with upper, lower, and digit'),
  body('name').trim().notEmpty(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      const phoneNumber = parsePhoneNumberFromString(value);
      if (!phoneNumber || !phoneNumber.isValid()) {
        throw new Error('Invalid phone number format. Please include country code.');
      }
      return true;
    })
    .customSanitizer((value) => {
      const phoneNumber = parsePhoneNumberFromString(value);
      return phoneNumber ? phoneNumber.format('E.164') : value;
    }),
];

async function login(req, res, next) {
  try {
    const user = await authService.login(req.body.email, req.body.password, res);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });
    const user = await authService.refresh(token, res);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.userId, res);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body, res);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findOne(
      { _id: req.user.userId, isActive: true },
      'name email role departmentId'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { loginRules, registerRules, validate, login, register, refreshToken, logout, me };
