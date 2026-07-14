process.env.TZ = 'Africa/Cairo';
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const http = require('node:http');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('node:path').resolve(__dirname, '../../.env') });

const User = require('../models/User');
const app = require('../app');

function httpPost(server, path, data) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = JSON.stringify(data);
    const options = {
      host: '127.0.0.1',
      port: addr.port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

let server;

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 2 });
  server = app.listen(0);
});

after(async () => {
  server.close();
  await User.deleteMany({ email: /auth-register-test/ });
  await mongoose.disconnect();
});

test('Registration fails if name contains numbers', async () => {
  const result = await httpPost(server, '/api/v1/auth/register', {
    email: 'auth-register-test-1@test.com',
    password: 'ValidPass123!',
    name: 'John Doe 3rd',
    phone: '+201234567890',
  });

  assert.equal(result.status, 400);
  assert.ok(result.body.errors);
  const nameError = result.body.errors.find(err => err.path === 'name');
  assert.ok(nameError);
  assert.equal(nameError.msg, 'Full name cannot contain numbers');
});

test('Registration succeeds if name has no numbers', async () => {
  const result = await httpPost(server, '/api/v1/auth/register', {
    email: 'auth-register-test-2@test.com',
    password: 'ValidPass123!',
    name: 'John Doe the Third',
    phone: '+201234567890',
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.name, 'John Doe the Third');
});
