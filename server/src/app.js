const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('mongo-sanitize');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const departmentRoutes = require('./routes/departments');
const appointmentRoutes = require('./routes/appointments');
const blockTimeRoutes = require('./routes/blockTime');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// ── Security headers ──────────────────────────────────────────────
app.use(helmet());

// ── CORS (credentials required for HTTP-only cookies) ─────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Mongo injection sanitisation ──────────────────────────────────
app.use((req, _res, next) => {
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  next();
});

// ── Rate limiting ─────────────────────────────────────────────────
const generalLimiter = rateLimit({ windowMs: 60_000, max: 100 });
const authLimiter = rateLimit({ windowMs: 60_000, max: 5 });

app.use('/api/v1', generalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/refresh', authLimiter);

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/staff', userRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/block-time', blockTimeRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// ── Global error handler ──────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    status = 400;
    message = 'This name is already in use.';
  }

  res.status(status).json({ error: message });
});

module.exports = app;
