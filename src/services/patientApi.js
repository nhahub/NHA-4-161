import api from './api';

/**
 * Patient-facing data layer. Thin wrappers around the shared `api` axios
 * instance — every call here hits the real backend, nothing is mocked.
 *
 * ── Already works today, no backend changes needed ───────────────────
 *   GET /api/v1/departments        → Department[]
 *   GET /api/v1/staff?role=doctor  → { users: User[] } (doctor list)
 *
 * ── Wired here, but needs backend work before it will succeed ────────
 *   GET  /api/v1/appointments  → for role 'patient' this currently returns
 *                                 ALL appointments (unscoped). Needs the
 *                                 same treatment doctors already get:
 *                                 `{ patientId: req.user.userId }`.
 *   POST /api/v1/appointments  → currently authorize(['admin','receptionist'])
 *                                 only. Needs 'patient' added, with the
 *                                 server forcing patientId = req.user.userId
 *                                 (never trust a client-supplied one).
 *   PUT  /api/v1/appointments/:id → needs a rule letting a patient cancel
 *                                 (status: 'cancelled') their OWN appointment.
 *   Appointment model          → needs a `patientId` field
 *                                 (ObjectId ref 'User'), doesn't exist yet.
 * ----------------------------------------------------------------------
 */

export async function fetchDepartments() {
  const res = await api.get('/departments');
  return res.data;
}

export async function fetchDoctors() {
  const res = await api.get('/staff?role=doctor&limit=200');
  return res.data.users;
}

export async function fetchMyAppointments() {
  const res = await api.get('/appointments?limit=200');
  return res.data; // { appointments, total }
}

export async function bookAppointment({ doctorId, departmentId, dateTime }) {
  const res = await api.post('/appointments', { doctorId, departmentId, dateTime });
  return res.data;
}

export async function cancelAppointment(appointmentId) {
  const res = await api.put(`/appointments/${appointmentId}`, { status: 'cancelled' });
  return res.data;
}