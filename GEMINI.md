# GEMINI.md — Hospital Smart Queue System (NHA-4-161)

> **Purpose**: Single source of truth for AI agent sessions working on this codebase.
> Auto-maintained — see [Maintenance](#maintenance-read-this-every-session) at the bottom.

---

## 1. Project Structure

**Two-package monorepo**: React 19 + Vite 8 + Tailwind v4 frontend (root `package.json`) and Express 5 + Mongoose 9 backend (`server/package.json`). Each has its own `node_modules`.

### Backend (`server/`)

Separate Node project — CommonJS (`"type": "commonjs"`), entry via `server/src/index.js`.

```
server/
├── package.json              # Express 5.2, Mongoose 9.7, bcryptjs 3, helmet, express-validator, express-rate-limit, mongo-sanitize
├── .env.example              # PORT, MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_ORIGIN, NODE_ENV
├── src/
│   ├── index.js              # Loads dotenv, connects DB, starts HTTP server on PORT (default 5000)
│   ├── app.js                # Express app: helmet → cors → json → cookieParser → mongoSanitize → rate limiters → routes → global error handler
│   ├── config/
│   │   └── db.js             # Mongoose connection: MONGODB_URI, maxPoolSize=5, auto-reconnect
│   ├── controllers/
│   │   ├── authController.js       # login/register/refresh/logout/me — express-validator rules + validate function
│   │   ├── userController.js       # Staff CRUD (list/create/update/remove) — express-validator rules
│   │   ├── departmentController.js # Department CRUD — catches ACTIVE_DEPENDENCIES_EXIST → 409
│   │   ├── appointmentController.js # Appointment CRUD + availability slots — role-based filtering in controller
│   │   └── analyticsController.js  # Weekly analytics — delegates to analyticsService
│   ├── middleware/
│   │   ├── authenticate.js   # Reads `accessToken` from cookies, verifies JWT, sets req.user = { userId, role }
│   │   └── authorize.js      # authorize(['role1','role2']) — checks req.user.role, returns 403
│   ├── models/
│   │   ├── User.js           # email (unique partial on isActive), passwordHash, name, role (admin|doctor|receptionist|patient), phone, departmentId, isActive, deletedAt, refreshTokenId — pre-save bcrypt (cost 12) + PASSWORD_REGEX
│   │   ├── Department.js     # name (unique partial on isActive), headUserId, isActive
│   │   └── Appointment.js    # patientId, doctorId, departmentId, dateTime, status (scheduled|attended|no-show|cancelled), isActive, deletedAt — compound indexes
│   ├── routes/
│   │   ├── auth.js           # /api/v1/auth — login, register, refresh (public); logout, me (authenticate)
│   │   ├── users.js          # /api/v1/staff — all require authenticate; POST/PUT/DELETE require authorize(['admin'])
│   │   ├── departments.js    # /api/v1/departments — all require authenticate; POST/PUT/DELETE require authorize(['admin'])
│   │   ├── appointments.js   # /api/v1/appointments — all require authenticate; POST requires authorize(['admin','receptionist','patient'])
│   │   └── analytics.js      # /api/v1/analytics — GET /weekly requires authenticate
│   ├── services/
│   │   ├── authService.js    # Core auth logic: JWT cookie-based, refresh token rotation via refreshTokenId (UUID on User doc)
│   │   ├── staffService.js   # User CRUD with transactional cascade: deactivation soft-deletes + cancels future appointments atomically
│   │   ├── departmentService.js   # Dependency-guard deletion: refuses if active head or staff exist
│   │   ├── appointmentService.js  # Appointment CRUD, populated queries, paginated
│   │   └── analyticsService.js    # 4 parallel aggregation pipelines: by status, department, doctor, daily trend
│   ├── tests/
│   │   ├── appointments.test.js   # Authorization guard tests (node:test)
│   │   └── cascade.test.js        # Cascade transaction correctness tests (node:test)
│   └── utils/
│       └── jwt.js            # signAccess, signRefresh, verifyAccess, verifyRefresh — separate secrets, 15m/7d TTL
```

### Frontend (`src/`)

Feature-based architecture enforced by `eslint-plugin-boundaries`.

```
src/
├── index.css                         # Tailwind v4 import, @theme tokens, dark mode overrides, custom animations
├── app/
│   ├── main.jsx                      # StrictMode → BrowserRouter → App
│   ├── App.jsx                       # AuthProvider → Routes (all routes defined here, role-based redirects)
│   └── App.css                       # ⚠ Dead — leftover Vite scaffold CSS
├── assets/
│   ├── hero.png                      # Landing page image
│   ├── react.svg, vite.svg
├── components/                       # Shared/reusable
│   ├── ConfirmModal.jsx              # ✓ Used by StaffPage, DepartmentsPage
│   ├── DashboardHeader.jsx           # ✓ Used by PatientDashboard, ReceptionistDashboard
│   ├── EmptyState.jsx                # ✓ Used across views
│   ├── Logo.jsx                      # ✓ Used everywhere
│   ├── ProtectedRoute.jsx            # ✓ Auth gate + role check in App.jsx
│   ├── StatusBadge.jsx               # ✓ Status pill component
│   ├── Toast.jsx                     # ✓ Bottom-right auto-dismiss (3500ms)
│   ├── RolePlaceholder.jsx           # ✓ "Coming soon" placeholder (currently unused)
│   ├── AppointmentCard.jsx           # ⚠ Dead — broken imports, superseded by doctor-dashboard local copy
│   ├── BlockTimeForm.jsx             # ⚠ Dead — same
│   ├── KpiBar.jsx                    # ⚠ Dead — uses old "completed" status vs "attended"
│   └── ScheduleTimeline.jsx          # ⚠ Dead — same
├── context/
│   └── AuthContext.jsx               # AuthProvider + useAuth() — user tri-state: undefined|null|object
├── features/
│   ├── auth/
│   │   ├── AuthPage.jsx              # Sign-in/register shell (tab UI)
│   │   ├── SignInForm.jsx            # Email/password → role-based redirect
│   │   └── RegisterForm.jsx          # Patient registration only
│   ├── dashboard/                    # Admin dashboard
│   │   ├── DashboardLayout.jsx       # Sidebar + <Outlet /> (nested routes)
│   │   └── DashboardHome.jsx         # KPI summary cards
│   ├── staff/
│   │   ├── StaffPage.jsx             # Staff table + CRUD
│   │   └── StaffForm.jsx             # Add/edit staff modal
│   ├── departments/
│   │   └── DepartmentsPage.jsx       # Department CRUD + ReassignModal
│   ├── analytics/
│   │   └── AnalyticsPage.jsx         # Recharts weekly analytics dashboard
│   ├── doctor-dashboard/
│   │   ├── DoctorDashboard.jsx       # Orchestrator (activeView state)
│   │   ├── seedDemoSchedule.js       # localStorage demo data (⚠ imported but not invoked)
│   │   ├── components/
│   │   │   ├── AppointmentCard.jsx   # ✓ Active version (uses "attended" status)
│   │   │   ├── BlockTimeForm.jsx
│   │   │   ├── DashboardHeader.jsx
│   │   │   ├── DashboardSidebar.jsx
│   │   │   ├── KpiBar.jsx
│   │   │   └── ScheduleTimeline.jsx
│   │   └── views/
│   │       ├── AppointmentsView.jsx
│   │       ├── BlockTimeView.jsx
│   │       ├── DailyScheduleView.jsx
│   │       └── DashboardView.jsx
│   ├── patient-dashboard/
│   │   ├── PatientDashboard.jsx      # Orchestrator (activeView state)
│   │   ├── components/
│   │   │   ├── PatientAppointmentCard.jsx
│   │   │   └── PatientSidebar.jsx
│   │   └── views/
│   │       ├── AppointmentsView.jsx
│   │       ├── BookAppointmentView.jsx  # Doctor select + availability slots
│   │       ├── DepartmentsView.jsx
│   │       ├── DoctorsView.jsx
│   │       ├── OverviewView.jsx
│   │       └── ProfileView.jsx          # ⚠ Exists but no sidebar nav item points to it
│   └── receptionist/
│       ├── ReceptionistDashboard.jsx # Orchestrator (activeView state)
│       ├── components/
│       │   ├── AppointmentModal.jsx
│       │   └── ReceptionistSidebar.jsx
│       └── views/
│           ├── AppointmentsManageView.jsx
│           ├── QueueManageView.jsx
│           └── ReceptionOverviewView.jsx
├── hooks/
│   ├── useForm.js                    # Generic controlled form hook
│   ├── useToast.js                   # Timed toast state
│   ├── useDarkMode.js                # <html class="dark"> toggle, localStorage("theme")
│   ├── useDepartments.js             # API-backed
│   ├── useDoctors.js                 # API-backed
│   ├── useDoctorAppointments.js      # API-backed
│   ├── usePatientAppointments.js     # API-backed
│   ├── useAppointments.js            # ⚠ Legacy — localStorage-based (used by useBlockTimes/seedDemoSchedule)
│   └── useBlockTimes.js              # ⚠ localStorage-based — no backend endpoint yet
├── services/
│   ├── api.js                        # Axios instance, baseURL='/api/v1', withCredentials, 401 refresh interceptor
│   ├── patientApi.js                 # Patient data layer: fetchDepartments, fetchDoctors, fetchMyAppointments, bookAppointment, cancelAppointment
│   └── receptionistApi.js            # Receptionist data layer: getAppointments, createAppointment, updateAppointment, cancelAppointment, updateAppointmentStatus, getDoctors
└── utils/
    └── storage.js                    # localStorage helpers + cross-component sync via custom event "medicare:local-storage-update"
```

### Config & Docs (root)

| File | Purpose |
|------|---------|
| `package.json` | Frontend: React 19, Vite 8, Tailwind v4, Axios, Recharts, Lucide, React Router DOM 7 |
| `vite.config.js` | React + Tailwind plugins, dev proxy `/api` → `localhost:5000`, chunk warning 800KB |
| `vercel.json` | Rewrites: `/api/*` → Railway backend (`hospital-smart-queue-production.up.railway.app`); SPA fallback `/*` → `/index.html` |
| `docker-compose.yml` | MongoDB 7 single-node replica set (`rs0`) with auto-init; named volume `mongo_data` |
| `.env.example` | Frontend: no env vars needed (proxy handles API routing) |
| `DEPLOY.md` | 6-step deploy: MongoDB Atlas → Railway (server) → vercel.json update → Vercel (client) → update CLIENT_ORIGIN → seed admin |
| `design.md` | MediCare Design System: HSL tokens, Plus Jakarta Sans / Inter, teal primary, dark mode, component specs |
| `ponytail.md` | Coding philosophy: YAGNI ladder, root-cause fixes, no unrequested abstractions, boring over clever |
| `eslint.config.mjs` | Boundary architecture enforced (8 element types: app→feature→components→hooks→utils→assets→services→context), no cross-feature imports |
| `.oxlintrc.json` | react + typescript + oxc plugins, hooks rules as errors |
| `Specs/v0.md` | Initial requirements spec |
| `Specs/Admin dashboard specs/` | System audit, implementation plan, production blueprint, task checklist (all completed) |
| `docs/errors.txt` | Known deployment errors (403 on POST appointments, 400s, department head assignment bug) |
| `index.html` | Entry: `/src/app/main.jsx`, favicon `/favicon.svg`, title "temp" (placeholder) |
| `public/` | `favicon.svg`, `icons.svg` |

---

## 2. Locked Architecture Decisions

These are facts discovered in the code, not suggestions.

### Auth: JWT HTTP-only cookies + refreshTokenId rotation
- Access tokens: 15 min TTL, signed with `JWT_ACCESS_SECRET`, payload `{ userId, role }` — `server/src/utils/jwt.js`
- Refresh tokens: 7-day TTL, signed with `JWT_REFRESH_SECRET`, payload `{ userId, role, refreshTokenId }` — `server/src/utils/jwt.js`
- Rotation: `refreshTokenId` (crypto.randomUUID) stored on User document, embedded in refresh JWT; rotated on every `/refresh` call — mismatch = revoked — `server/src/services/authService.js`
- Revocation: setting `refreshTokenId = null` on User doc invalidates all refresh tokens; done on logout and user deactivation
- Both tokens stored as httpOnly cookies: `accessToken` and `refreshToken`; `sameSite='strict'`, `secure` in production only — `server/src/services/authService.js`
- **No localStorage for tokens** — cookies only
- Frontend session restore: on mount, `AuthContext` calls `GET /api/v1/auth/me` to check session from existing cookie

### Database: MongoDB via Mongoose 9 with Transactions
- Connection in `server/src/config/db.js` using `MONGODB_URI`; requires replica set for transactions
- All models use `timestamps: true`
- **Soft-delete pattern**: `isActive` boolean + `deletedAt` timestamp across all models
- **Partial unique indexes**: User.email and Department.name are unique only among active records
- **Transactions used**: `staffService.deactivateUser()` uses Mongoose sessions for atomic cascade (soft-delete user + cancel future appointments)
- Local dev: Docker Compose runs single-node replica set (`rs0`) with auto-initialization
- Production: MongoDB Atlas (free cluster, already a replica set)

### Deployment: Vercel (client) + Railway (server)
- Frontend on Vercel as static SPA
- Backend on Railway at `hospital-smart-queue-production.up.railway.app`
- API proxied via Vercel rewrites (`/api/*` → Railway) — same-origin trick so `SameSite=Strict` cookies work
- Vite dev server proxies `/api` → `localhost:5000` for local development
- **Frontend needs zero env vars** — API routing handled entirely by proxies

### Communication: REST Only (No WebSockets)
- No Socket.IO, no WebSockets, no SSE anywhere in the codebase
- Analytics comment in `analyticsService.js` mentions future "Redis pub/sub + Change Streams" but nothing is implemented
- Frontend has no polling intervals currently — data fetched on mount and on user actions

### Express Middleware Chain (order in `app.js`)
1. `helmet()` — security headers
2. `cors({ origin: CLIENT_ORIGIN, credentials: true })` — CORS with cookies
3. `express.json()` — body parsing
4. `cookieParser()` — cookie parsing
5. Custom `mongoSanitize` — strips `$` operators from `req.body` and `req.query`
6. `generalLimiter` on `/api/v1` — 100 req/60s
7. `authLimiter` on `/api/v1/auth/login` — 5 req/60s
8. `authLimiter` on `/api/v1/auth/refresh` — 5 req/60s
9. Route handlers
10. Global error handler — catches `next(err)`, handles Mongo 11000 (duplicate key) → 400, defaults to 500

### Password Hashing
- bcryptjs with **cost 12** — enforced in User model `pre('save')` hook
- Password complexity: `PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/` — validated in pre-save hook
- `comparePassword(plain)` instance method on User model

### Roles
- Four roles: `admin`, `doctor`, `receptionist`, `patient` — enum in `server/src/models/User.js`
- Public registration creates `patient` only
- Staff (admin/doctor/receptionist) created by admin via `/api/v1/staff` endpoint
- Each role has a dedicated dashboard route: `/dashboard` (admin), `/doctor-dashboard`, `/patient-dashboard`, `/receptionist-dashboard`

### Frontend Architecture: Boundary-Enforced Layers
- `eslint-plugin-boundaries` enforces strict import rules across 8 element types
- Dependency flow: `app` → `feature` → `components/hooks/services/context` → `utils/assets`
- **No cross-feature imports** — each feature is self-contained
- Features with complex UIs (doctor, patient, receptionist) use `components/` + `views/` subdirectories

### Frontend Routing
- React Router DOM v7, `BrowserRouter` mode
- All routes in `src/app/App.jsx`
- Admin dashboard uses nested routes + `<Outlet>`
- Doctor, patient, receptionist dashboards use **state-driven view switcher** (`activeView` state + conditional rendering via sidebar buttons)
- `ProtectedRoute` wrapper: `undefined` user → render nothing; `null` → redirect `/login`; wrong role → redirect to user's own dashboard

---

## 3. Conventions

### Naming
| What | Convention | Examples |
|------|-----------|----------|
| Model files | PascalCase singular | `User.js`, `Department.js`, `Appointment.js` |
| Route files | lowercase plural | `auth.js`, `users.js`, `departments.js`, `appointments.js` |
| Controller/service files | camelCase | `authController.js`, `staffService.js`, `analyticsService.js` |
| React components | PascalCase | `AppointmentCard.jsx`, `DashboardLayout.jsx` |
| Hooks | camelCase with `use` prefix | `useForm.js`, `useDarkMode.js`, `useDoctorAppointments.js` |
| Service files (frontend) | camelCase | `api.js`, `patientApi.js`, `receptionistApi.js` |
| Variables & functions | camelCase | `signAccess`, `refreshTokenId`, `deactivateUser` |
| Constants | UPPER_SNAKE_CASE | `ACCESS_TTL`, `REFRESH_TTL`, `COOKIE_OPTS`, `PASSWORD_REGEX` |
| Route paths | lowercase, kebab-case for multi-word | `/api/v1/staff`, `/api/v1/departments/:id/reassign-head` |
| Backend module system | CommonJS | `require` / `module.exports` |
| Frontend module system | ESM | `import` / `export` |

### Error Handling
- **Backend controllers**: try/catch → `next(err)` to forward to global error handler
- **Backend services**: create `new Error(msg)` with custom `.status` property (e.g., `err.status = 404`)
- **Global error handler**: catches all `next(err)`; Mongo 11000 → 400; defaults to 500; responds `{ error: message }`
- **Special case**: Department controller catches `ACTIVE_DEPENDENCIES_EXIST` locally → 409 with detail
- **Frontend**: try/catch around API calls; error extracted as `err.response?.data?.error` (string or object); displayed inline (auth forms) or via Toast component (dashboards)
- **No global error boundary** on frontend — render crashes are unhandled

### Validation
- **Backend**: `express-validator` 7.3 — each controller defines rule arrays (`createRules`, `updateRules`, `listRules`) + local `validate()` function that calls `validationResult(req)` → 400 with `{ errors: [...] }`
- **Route wiring pattern**: `rules → validate → handler` (e.g., `router.post('/', createRules, validate, create)`)
- **Model-level**: Password regex in User pre-save hook; Mongoose enum validation on role/status fields
- **Input sanitization**: `mongo-sanitize` applied globally to `req.body` and `req.query`
- **Frontend**: No validation library — all manual checks

### Data Fetching (Frontend)
- Custom hooks follow consistent pattern: `useState` for data/loading/error + `useCallback` for refresh + `useEffect` to trigger
- Service layer split: `patientApi.js` and `receptionistApi.js` wrap axios calls; admin pages call `api` directly
- **401 interceptor** in `services/api.js`: silently refreshes token and retries once; if refresh fails, error propagates

### Soft Delete Pattern (Backend)
- All entities use `isActive` boolean + `deletedAt` timestamp
- Queries filter by `isActive: true` (never hard delete user data)
- Partial unique indexes allow reuse of soft-deleted emails/names

### Layered Architecture (Backend)
- Routes → Controllers → Services → Models (clean separation)
- Controllers handle HTTP concerns (req/res, validation, status codes)
- Services handle business logic and DB operations
- Models handle schema definition and data-level hooks

### Styling (Frontend)
- **Tailwind CSS v4** with CSS-first config (`@import "tailwindcss"` + `@theme {}` in `index.css`)
- Semantic design tokens: `--color-primary` (emerald-600), `--color-background`, `--color-card`, `--color-border`, `--color-muted`, `--color-warning`, `--color-success`, `--color-info`, `--color-destructive`
- **Dark mode**: class-based (`.dark` on `<html>`), CSS variable overrides in `.dark {}` block
- **Icons**: `lucide-react` exclusively
- **No CSS modules, no styled-components** — all Tailwind utility classes inline in JSX
- Consistent card pattern: `rounded-2xl border border-border bg-card p-4/5 text-card-foreground shadow-sm`

### Component Patterns (Frontend)
- **Sidebar**: All 4 dashboards follow identical structure — Logo, NAV_ITEMS array mapped to buttons, user info + sign-out
- **Dashboard orchestrator**: `activeView` state + sidebar nav → conditional rendering of view components
- **Modal**: `fixed inset-0 z-50 bg-black/40` overlay + `rounded-2xl border border-border bg-card p-6 shadow-xl` dialog; click-outside-to-close
- **Cancel confirmation**: Inline `confirmingCancel` state with autoFocus + onBlur dismiss

---

## 4. Known Constraints

### Deployment
- **Vercel**: Frontend static hosting + API rewrite proxy to Railway
- **Railway**: Backend Express server at `hospital-smart-queue-production.up.railway.app`
- **MongoDB Atlas**: Production database (free cluster, replica set by default)
- No WebSocket support without adding a persistent server (Railway supports it but Vercel rewrite doesn't proxy WebSocket upgrades)

### Server Environment Variables
| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Express server port | `5000` |
| `MONGODB_URI` | MongoDB connection string (must include `?replicaSet=rs0` for local) | `mongodb://localhost:27017/medicare?replicaSet=rs0` |
| `JWT_ACCESS_SECRET` | Access token signing secret | — |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — |
| `CLIENT_ORIGIN` | CORS allowed origin | `http://localhost:5173` |
| `NODE_ENV` | Controls cookie `secure` flag | `development` |

### Client Environment Variables
- **None required** — API base URL hardcoded as `/api/v1`; proxied by Vite (dev) and Vercel (prod)

### Local Dev Setup
1. `docker-compose up -d` — starts MongoDB replica set on `localhost:27017`
2. `cd server && npm run dev` — starts Express with nodemon on port 5000
3. `npm run dev` (from root) — starts Vite dev server on port 5173 with API proxy

### Testing
- **Backend**: Node.js built-in test runner (`node:test` + `node:assert/strict`) — 2 test files in `server/src/tests/`
- **Frontend**: No tests — no testing library installed
- Run backend tests: `cd server && npm test`

### Known Tech Debt
- 4 dead shared components in `src/components/` (broken imports, superseded by doctor-dashboard local copies)
- `App.css` is dead Vite scaffold CSS
- `seedDemoSchedule.js` imported but not invoked in DoctorDashboard
- `ProfileView.jsx` exists in patient-dashboard but has no sidebar nav item
- `useAppointments.js` and `useBlockTimes.js` are localStorage-based legacy hooks (no backend endpoints for block times)
- `index.html` title is placeholder "temp"
- Inconsistent status terminology: shared components use "completed", doctor-dashboard uses "attended" (matching backend)
- Some `console.log` debug statements remain in `DashboardSidebar.jsx`

---

## 5. Coding Philosophy (Ponytail)

Derived from [ponytail.md](file:///c:/Project/Smart%20queue%20hospital%20system/NHA-4-161/ponytail.md). Efficient, lazy, and root-cause-driven coding.

### The Ladder
Stop at the first rung that holds:
1. **Does this need to exist at all?** (YAGNI - You Ain't Gonna Need It)
2. **Already in this codebase?** Reuse the helper, util, type, or pattern that already lives here. Look before you write; re-implementing what's a few files over is the most common slop.
3. **Stdlib does it?** Use it.
4. **Native platform feature covers it?** Use standard browser/native capabilities (e.g., `<input type="date">` over a custom datepicker library, CSS over JS, DB constraints over app logic).
5. **Already-installed dependency solves it?** Use it. Never add a new dependency if a few lines of code or existing tools can do it.
6. **Can this be one line?** Make it one line.
7. **Only then:** Write the absolute minimum code that works.

*Note: Validation, security, error handling, and accessibility are explicitly kept and never cut.*

### Bug Fixes
**Bug fix = root cause, not symptom.** A bug report names a symptom. Before editing:
1. Grep every caller of the function you're about to touch.
2. The lazy fix is the root-cause fix: one guard in the shared function is a smaller diff than a guard in every caller.
3. Patching only the path the ticket names leaves sibling callers broken. Fix it once, where all callers route through.

### Rules
- **No unrequested abstractions:** No interfaces with one implementation, no factories for one product, no config for a value that never changes.
- **No boilerplate/scaffolding "for later":** Later can scaffold for itself.
- **Deletion over addition:** Boring over clever. Clever is what someone decodes at 3am.
- **Fewest files possible:** Shortest working diff wins, but only once you understand the problem. The smallest change in the wrong place is a second bug.

---

## 6. Tool-Call Behavior

> **For AI agent sessions working on this codebase:**

- **Read this file first.** Before exploring the codebase, read `GEMINI.md` — structure, conventions, and decisions are already documented.
- **Skip narrating routine exploration.** Do not describe that you are "listing the directory" or "reading the file." Just do it and report findings.
- **Prefer one recursive grep/glob over multiple list+view calls.** Use `grep_search` with the project root and appropriate includes to find patterns across the codebase in a single call, rather than listing directories → viewing files one by one.
- **Backend is a separate package.** It lives at `server/` with its own `package.json` and `node_modules`. Source code is under `server/src/`. Run backend commands from `server/` directory.
- **Backend is CommonJS, frontend is ESM.** Don't mix `require`/`module.exports` with `import`/`export`.
- **Backend uses Express 5** (not 4). Check Express 5 docs for breaking changes (e.g., `req.query` is a getter, `res.status().json()` chaining differences).
- **Frontend uses Tailwind v4** with CSS-first config. No `tailwind.config.js` — all tokens in `src/index.css` via `@theme {}`.
- **All frontend routes are in `src/app/App.jsx`** — don't search for a separate router file.
- **Boundary rules are enforced.** Don't import across features. Check `eslint.config.mjs` for the dependency graph.
- **Auth uses cookies, not localStorage.** Don't look for tokens in localStorage — they're in httpOnly cookies.
- **API base URL is `/api/v1`** (hardcoded in `src/services/api.js`). In dev, Vite proxies to `localhost:5000`. In prod, Vercel rewrites to Railway.
- **Read `ponytail.md` for coding philosophy** — YAGNI, root-cause fixes, no unrequested abstractions.

---

## 7. Maintenance (read this every session)

Before ending any task, check whether you discovered:

- a new file/folder that isn't reflected in "Project Structure" above
- a convention you had to infer that isn't documented here
- a decision the user confirmed that isn't recorded here
- a mistake or dead-end you hit that would waste tokens if repeated

If any apply, **append a short bullet to the relevant section above.**
Do not ask the user for permission to update this file — just do it,
and mention in one line what you added.

---

*Last generated: 2026-07-14 by full codebase scan (3 research subagents: backend, frontend, config/deployment).*

