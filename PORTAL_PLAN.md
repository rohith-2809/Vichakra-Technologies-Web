# Vichakra Technologies — Admin Panel & Client Portal
## Full Build Plan · MERN Stack · Phase-Step-Wise · Dependency Flow

---

## Architecture Overview

```
vichakra-platform/
├── client/          ← existing React site + new portal/admin pages
│   ├── src/
│   │   ├── pages/admin/       ← new admin pages
│   │   ├── pages/portal/      ← new client portal pages
│   │   ├── components/admin/  ← admin-specific components
│   │   ├── components/portal/ ← portal-specific components
│   │   ├── context/           ← AuthContext, ProjectContext
│   │   ├── hooks/             ← useAuth, useProjects, useFileUpload
│   │   └── api/               ← axios instance + API calls
└── server/          ← new Express + Node.js backend
    ├── src/
    │   ├── routes/            ← auth, admin, client, projects, files
    │   ├── controllers/       ← business logic
    │   ├── models/            ← Mongoose schemas
    │   ├── middleware/         ← auth guard, role check, upload
    │   └── config/            ← db, env, cors, multer
    └── uploads/               ← local file storage (dev)
```

**Roles:** `admin` (Vichakra team) · `client` (confirmed deal)  
**Auth:** JWT access token (15m) + refresh token (7d), httpOnly cookie  
**File Storage:** Multer (local dev) → Cloudinary or S3 (production)  
**Design System:** Teal `#0F766E`, Outfit font, Tailwind CSS, Framer Motion, Lucide icons  

---

## Dependency Flow

```
Phase 0 (Foundation)
    └── Phase 1 (Backend Auth)
            └── Phase 2 (Frontend Auth + Login)
                    ├── Phase 3 (Admin Core UI)
                    │       └── Phase 4 (Admin: Clients & Projects)
                    │               └── Phase 5 (Admin: Files & Status)
                    └── Phase 6 (Client Portal: Onboarding & Dashboard)
                            └── Phase 7 (Client Portal: Requirements)
                                    └── Phase 8 (Client Portal: Feedback & Support)
                                            └── Phase 9 (Integration & E2E Testing)
```

---

## Phase 0 — Foundation & Monorepo Setup

### Objectives
- Establish the full project structure so all future phases have a stable base
- Wire up local MongoDB, Express server, and connect to the existing React frontend

### Scope
| In | Out |
|----|-----|
| Monorepo folder setup (client/ + server/) | Cloud deployment config |
| Express app scaffold + CORS | Load balancing / reverse proxy |
| MongoDB connection (Mongoose) | Database seeding scripts |
| Environment variable setup (.env) | CI/CD pipelines |
| Axios instance in React with base URL | GraphQL / WebSockets |
| Proxy config in Vite for local dev | |

### Steps
1. **Create `server/` directory** alongside `client/` (existing repo root)
2. `npm init` in server, install: `express`, `mongoose`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`, `multer`, `express-validator`, `morgan`
3. Scaffold `server/src/` — `app.js`, `config/db.js`, `routes/index.js`
4. Create `.env` with `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, `CLIENT_URL`
5. Set up `config/db.js` — Mongoose connect with retry logic
6. Add `vite.config.js` proxy: `/api → http://localhost:5000`
7. Install `axios` in client, create `src/api/axios.js` with base URL + interceptors (auto-attach JWT, handle 401 refresh)
8. Add `nodemon` dev script, confirm server starts and DB connects

### Risks & Constraints
- **Risk:** MongoDB Atlas free tier has connection limits — use local MongoDB for dev, document Atlas setup separately
- **Risk:** CORS misconfiguration will block all API calls — lock allowed origins to `localhost:5173` in dev
- **Constraint:** `.env` must never be committed — add to `.gitignore` immediately

### What to Test
- [ ] `GET /api/health` returns `{ status: "ok" }` from Express
- [ ] Mongoose connects successfully (console log on startup)
- [ ] Vite proxy routes `/api/*` to Express without CORS errors
- [ ] Axios instance attaches `Authorization: Bearer <token>` header when token exists

---

## Phase 1 — Backend Auth System

> **Depends on:** Phase 0 complete

### Objectives
- Build secure, role-aware JWT authentication on the server
- Support `admin` and `client` roles with separate onboarding states

### Scope
| In | Out |
|----|-----|
| User model (Mongoose) | OAuth / social login |
| Register (admin-only action) | Email verification flow |
| Login → access + refresh tokens | 2FA |
| Refresh token rotation | Password strength meter |
| Logout (invalidate refresh token) | Account deletion |
| Auth middleware (verify JWT) | |
| Role middleware (`requireAdmin`, `requireClient`) | |
| First-login flag on User model | |

### Data Model — `User`
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: enum['admin', 'client'],
  company: String,          // client only
  phone: String,
  avatar: String,           // URL
  isFirstLogin: Boolean,    // default: true (client only)
  isActive: Boolean,        // admin can deactivate
  refreshToken: String,     // stored hashed
  createdAt, updatedAt
}
```

### Steps
1. Create `models/User.js` with schema above + pre-save bcrypt hook
2. Create `controllers/authController.js`:
   - `register`: Admin-only, creates client accounts, hashes password, returns new user (no token)
   - `login`: Validates credentials, issues access token (15m) + refresh token (7d), stores hashed refresh in DB
   - `refresh`: Validates refresh token, issues new access token
   - `logout`: Clears refresh token from DB + clears cookie
   - `getMe`: Returns current user from JWT
3. Create `middleware/auth.js` — `protect` (verify JWT), `requireRole(...roles)` (role guard)
4. Create `routes/auth.js` — wire routes with validation (express-validator)
5. Add global error handler middleware in `app.js`

### Risks & Constraints
- **Risk:** Storing refresh token in localStorage is XSS-vulnerable — store in httpOnly cookie; access token in memory (React state)
- **Risk:** Token replay attacks on logout — always hash stored refresh tokens with bcrypt
- **Constraint:** Only admins can create new user accounts — no public registration endpoint

### What to Test
- [ ] `POST /api/auth/login` with valid credentials returns access token + sets httpOnly cookie
- [ ] `POST /api/auth/login` with wrong password returns 401
- [ ] Protected route returns 401 without token, 403 for wrong role
- [ ] `POST /api/auth/refresh` issues new access token from valid cookie
- [ ] `POST /api/auth/logout` clears cookie and invalidates DB refresh token

---

## Phase 2 — Frontend Auth + Login Page

> **Depends on:** Phase 1 complete

### Objectives
- Build the login page that visually matches the existing site
- Implement AuthContext with token refresh, protected routes, and role-based redirects

### Scope
| In | Out |
|----|-----|
| Login page (`/login`) | Forgot password / OTP |
| AuthContext (React Context) | Remember me (persistent sessions beyond 7d) |
| `useAuth` hook | Account settings page |
| `ProtectedRoute` component (role-aware) | |
| Auto-refresh on 401 (Axios interceptor) | |
| Redirect after login by role | |

### UI Design (consistent with existing site)
- Background: `bg-hero-gradient` + `bg-dot-grid` (same as HomePage hero)
- Card: `premium-card` centered, max-width `md`, with glass morphism
- Brand: circular logo + "Vichakra Technologies" heading
- Input: `.input-field` class (already defined in `index.css`)
- Button: `<Button variant="primary" size="lg">` (existing component)
- Animation: `fadeUp` on mount via Framer Motion
- Error states: red-500 inline messages

### Steps
1. Create `src/context/AuthContext.jsx` — stores `user`, `accessToken` (in-memory), `loading`; exposes `login()`, `logout()`, `refreshToken()`
2. Create `src/hooks/useAuth.js` — consumes AuthContext
3. Update `src/api/axios.js` — request interceptor attaches token; response interceptor handles 401 → silent refresh → retry
4. Create `src/components/auth/ProtectedRoute.jsx` — checks auth + role, redirects accordingly:
   - Unauthenticated → `/login`
   - `admin` → `/admin`
   - `client` → `/portal`
5. Create `src/pages/auth/LoginPage.jsx` — form with email + password, calls `login()`, shows loading state
6. Update `App.jsx` — wrap with `<AuthProvider>`, add routes:
   - `/login` → LoginPage
   - `/admin/*` → ProtectedRoute (role: admin) → AdminLayout
   - `/portal/*` → ProtectedRoute (role: client) → PortalLayout

### Risks & Constraints
- **Risk:** Access token stored in React state is lost on page refresh — on app load, silently call `/api/auth/refresh` to restore session from cookie
- **Risk:** Flash of unauthenticated content on refresh — show full-screen loading spinner while auth is restoring
- **Constraint:** Login page must not share Navbar/Footer with main site — use a separate layout

### What to Test
- [ ] Login with admin credentials redirects to `/admin`
- [ ] Login with client credentials redirects to `/portal`
- [ ] Navigating to `/admin` while unauthenticated redirects to `/login`
- [ ] Page refresh retains session (silent refresh from cookie works)
- [ ] Wrong credentials shows inline error, not alert
- [ ] Logout clears state and redirects to `/login`

---

## Phase 3 — Admin Panel: Core Layout & Dashboard

> **Depends on:** Phase 2 complete

### Objectives
- Build the admin shell layout (sidebar + header)
- Build the overview dashboard with live stats

### Scope
| In | Out |
|----|-----|
| Admin sidebar (collapsible) | Multi-admin permissions/roles |
| Admin header with profile + logout | Audit logs |
| Dashboard stats (clients, projects, open items) | Analytics charts (deferred to later) |
| Responsive layout | Theme switcher |

### UI Design
- Sidebar: `bg-gray-950` (same as Footer), teal accent for active nav item, Lucide icons
- Header: `bg-white` with bottom border, admin avatar + name + logout button
- Stats cards: `StatCard` component (already exists), gradient text for numbers
- Layout: fixed sidebar (240px) + scrollable main content area
- Consistent with site: Outfit font, `#0F766E` accent, `premium-card` for content areas

### Steps
1. Create `src/pages/admin/` directory
2. Create `src/components/admin/AdminLayout.jsx` — sidebar + header shell, outlet for child pages
3. Create `src/components/admin/AdminSidebar.jsx` — nav links: Dashboard, Clients, Projects, Files, Status, Settings
4. Create `src/components/admin/AdminHeader.jsx` — title area + admin profile dropdown
5. Create `src/pages/admin/DashboardPage.jsx` — fetch summary stats from `/api/admin/stats`:
   - Total clients, active projects, pending reviews, files stored
   - Recent activity feed (last 5 actions)
6. Create `GET /api/admin/stats` endpoint on server

### Risks & Constraints
- **Risk:** Sidebar z-index conflicts with modals on mobile — use portal-based modals
- **Constraint:** All `/api/admin/*` routes must be gated by `protect + requireRole('admin')` middleware

### What to Test
- [ ] Admin sidebar renders all nav items with correct icons
- [ ] Active route is highlighted in sidebar
- [ ] Dashboard stats load from API (not hardcoded)
- [ ] Sidebar collapses to icon-only on small screens
- [ ] Logout from header clears session correctly

---

## Phase 4 — Admin Panel: Client & Project Management

> **Depends on:** Phase 3 complete

### Objectives
- Give admins full CRUD over clients and projects
- Link projects to clients; support milestones and status

### Scope
| In | Out |
|----|-----|
| Client list + add/edit/deactivate | Bulk import clients (CSV) |
| Client detail view | Client billing/invoicing |
| Project CRUD | Gantt chart view |
| Milestone management per project | Time tracking |
| Assign project to client | |
| Project status: Draft→Active→Review→Delivered→Closed | |

### Data Models

**Project:**
```js
{
  title: String,
  description: String,
  client: ObjectId (ref: User),
  status: enum['draft','active','in-review','delivered','closed'],
  milestones: [{ title, dueDate, completed: Boolean }],
  demoLinks: [{ label, url }],
  attachments: [ObjectId (ref: File)],
  notes: String,           // internal admin-only notes
  startDate, endDate,
  createdAt, updatedAt
}
```

**Client Profile** (extension of User):
```js
{
  // stored in User model
  company: String,
  industry: String,
  projectsAssigned: [ObjectId (ref: Project)]
}
```

### Steps
1. Create `models/Project.js` with schema above
2. Create `controllers/adminController.js` — client CRUD, project CRUD
3. Create routes: `GET/POST /api/admin/clients`, `PUT/DELETE /api/admin/clients/:id`, same pattern for projects
4. Build `src/pages/admin/ClientsPage.jsx` — table with search/filter, "Add Client" modal (creates User with role: client, generates temp password)
5. Build `src/pages/admin/ClientDetailPage.jsx` — client info + linked projects list
6. Build `src/pages/admin/ProjectsPage.jsx` — project cards with status badges, filter by status/client
7. Build `src/pages/admin/ProjectDetailPage.jsx` — milestone checklist, demo link manager, status dropdown, notes textarea
8. Build reusable `src/components/admin/StatusBadge.jsx` — color-coded status pill

### Risks & Constraints
- **Risk:** Admins accidentally deactivating a client mid-project — show warning modal if client has active projects
- **Risk:** Temp passwords sent in response (not email) during dev — flag clearly in UI to change method before production
- **Constraint:** Project deletion should be soft-delete only (mark `isDeleted: true`) to preserve client history

### What to Test
- [ ] Create client → user appears in DB with role: `client` and `isFirstLogin: true`
- [ ] Create project + assign to client → client can see it in portal (Phase 6 verification)
- [ ] Milestone toggle (complete/incomplete) persists on refresh
- [ ] Project status change updates immediately in both admin and client views
- [ ] Deactivated client cannot log in

---

## Phase 5 — Admin Panel: File Management & Status Updates

> **Depends on:** Phase 4 complete

### Objectives
- Allow admins to upload, organize, and attach files to projects or clients
- Allow admins to broadcast status updates visible to clients

### Scope
| In | Out |
|----|-----|
| File upload (Multer) with type/size validation | Video streaming |
| File browser per project | CDN integration |
| Attach/detach files from projects | Folder hierarchy |
| Global status announcements | Email notifications |
| Per-project status notes for client | Push notifications |

### Data Model — `File`
```js
{
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  path: String,            // local path (dev) / cloud URL (prod)
  uploadedBy: ObjectId (ref: User),
  project: ObjectId (ref: Project),
  isPublic: Boolean,       // client-visible or internal only
  createdAt
}
```

### Data Model — `StatusUpdate`
```js
{
  title: String,
  message: String,
  type: enum['info','success','warning'],
  project: ObjectId (ref: Project),   // null = global
  createdBy: ObjectId (ref: User),
  createdAt
}
```

### Steps
1. Create `models/File.js` and `models/StatusUpdate.js`
2. Configure `middleware/upload.js` — Multer: 10MB limit, allowed types: jpg/png/pdf/zip/mp4/doc/xlsx
3. Create file routes: `POST /api/admin/files/upload`, `GET /api/admin/files`, `DELETE /api/admin/files/:id`
4. Create status routes: `POST/GET /api/admin/status-updates`, `DELETE /api/admin/status-updates/:id`
5. Build `src/pages/admin/FilesPage.jsx` — drag-and-drop upload zone (`<input type="file">`), file grid with preview thumbnails, attach-to-project selector
6. Build `src/pages/admin/StatusUpdatesPage.jsx` — compose update form, list of sent updates, project selector (or global)
7. Add file section to `ProjectDetailPage.jsx` — show attached files, toggle `isPublic`

### Risks & Constraints
- **Risk:** Large file uploads blocking the event loop — use streaming uploads with Multer
- **Risk:** Public files accidentally exposing internal documents — `isPublic: false` by default; require explicit toggle
- **Constraint:** File storage path must be configurable via env var for easy switch to cloud storage

### What to Test
- [ ] Upload a 5MB PDF → file appears in file browser with correct metadata
- [ ] Upload beyond 10MB → rejected with clear error message
- [ ] Toggle file `isPublic` → client sees/doesn't see file in portal
- [ ] Post a global status update → appears in all client dashboards
- [ ] Post a project-specific update → only appears for that project's client
- [ ] Delete a file → removed from DB and disk

---

## Phase 6 — Client Portal: Onboarding & Dashboard

> **Depends on:** Phase 2 (Auth) + Phase 4 (Projects exist)

### Objectives
- First-time client experience with tutorial overlay
- Client dashboard showing their project(s), progress, and updates

### Scope
| In | Out |
|----|-----|
| Client portal shell layout | Multiple client accounts per company |
| First-login tutorial (step-by-step overlay) | Video walkthrough |
| Dashboard: active projects, progress, recent updates | Billing history |
| Project progress bar (% milestones complete) | Calendar view |
| Demo link viewer | |
| Status updates feed | |

### UI Design
- Layout: minimal sidebar (Home, My Project, Requirements, Support, Feedback) + header
- Color: same teal brand, `premium-card` for sections, clean white backgrounds
- Tutorial: full-screen step overlay with dark backdrop, `fadeIn` animation, "Next / Got it" buttons
- Progress: segmented milestone bar, teal fill, gray empty segments
- Welcome message: "Welcome, [Name]" with company name

### Steps
1. Create `src/pages/portal/` directory
2. Create `src/components/portal/PortalLayout.jsx` — slim sidebar + header, client-specific nav
3. Create `src/components/portal/OnboardingTutorial.jsx` — multi-step overlay (5 steps: Welcome → My Project → Requirements → Support → Done), stored completion in `User.isFirstLogin`
4. Create `src/pages/portal/PortalDashboardPage.jsx`:
   - Fetch client's projects from `GET /api/portal/projects`
   - Display project status, milestone progress bar, recent status updates
   - Demo links section (if any published)
5. Create `GET /api/portal/projects` (client-scoped: only returns their projects)
6. Create `GET /api/portal/status-updates` (returns global + their project updates)
7. `PATCH /api/portal/onboarding-complete` — sets `isFirstLogin: false`

### Risks & Constraints
- **Risk:** Client sees projects from other clients — all portal queries MUST filter by `req.user._id` or project's client field
- **Risk:** Tutorial re-appearing on every login if `isFirstLogin` update fails silently — add error handling and retry
- **Constraint:** If client has no active project yet (deal confirmed but project not created), show a friendly empty state — not an error

### What to Test
- [ ] First login triggers tutorial overlay
- [ ] Second login does NOT show tutorial
- [ ] Client only sees their own projects (not others)
- [ ] Milestone completion % calculates correctly
- [ ] Demo links open in new tab
- [ ] Status update feed shows both global and project-specific updates
- [ ] Empty state renders correctly when no project assigned yet

---

## Phase 7 — Client Portal: Requirements Submission

> **Depends on:** Phase 6 complete

### Objectives
- Allow clients to submit their full project vision: text, reference images, files, and structured answers
- Admin can view submissions inside the project detail

### Scope
| In | Out |
|----|-----|
| Multi-step requirements form | Real-time collaborative editing |
| Text fields: vision, goals, preferences | AI-generated requirement parsing |
| Image/file uploads (reference material) | Version history of requirements |
| Progress save (draft) | |
| Admin view of client submissions | |
| Submission lock after first submit (edit-request flow) | |

### Data Model — `Requirements`
```js
{
  project: ObjectId (ref: Project),
  client: ObjectId (ref: User),
  vision: String,                   // "What do you want to build?"
  targetAudience: String,
  goals: [String],                  // list of specific goals
  designPreferences: {
    style: String,                  // minimal, bold, playful, etc.
    colorPreference: String,
    referenceWebsites: [String]
  },
  features: [String],               // requested feature list
  files: [ObjectId (ref: File)],    // reference images, brand assets
  additionalNotes: String,
  status: enum['draft','submitted','acknowledged'],
  submittedAt: Date
}
```

### Steps
1. Create `models/Requirements.js`
2. Create portal routes: `POST /api/portal/requirements`, `GET /api/portal/requirements/:projectId`, `PATCH /api/portal/requirements/:id` (draft save)
3. Create admin route: `GET /api/admin/projects/:id/requirements` (view client submission)
4. Build `src/pages/portal/RequirementsPage.jsx` — multi-step form (4 steps):
   - **Step 1: Vision** — textarea for description + target audience
   - **Step 2: Design** — style preference selector (visual cards), color input, reference URLs
   - **Step 3: Features** — tag-based feature input (type + add to list)
   - **Step 4: Files** — drag-and-drop multi-file upload for reference images/brand assets
5. Add "Save Draft" auto-save (debounced) + "Submit" button (locks form)
6. Add requirements tab in `src/pages/admin/ProjectDetailPage.jsx` — read-only view of submission
7. Admin can mark requirements as "Acknowledged" — updates status + shows confirmation to client

### Risks & Constraints
- **Risk:** Large reference image uploads (5+ images) — implement client-side compression for images before upload, or enforce 5MB per file
- **Risk:** Client submits incomplete requirements — enforce minimum field completion before enabling "Submit" (Step completion indicators)
- **Constraint:** After submission, form becomes read-only; any changes require client to message support (handled in Phase 8)

### What to Test
- [ ] Draft saves automatically without page reload
- [ ] Refreshing the page restores draft
- [ ] All 4 steps must have minimum data before "Submit" is enabled
- [ ] After submit, form fields become read-only
- [ ] Admin sees submitted requirements in project detail
- [ ] File uploads within requirements attach to the correct project
- [ ] "Acknowledged" status update visible to client

---

## Phase 8 — Client Portal: Feedback, Support & Post-Project

> **Depends on:** Phase 7 complete

### Objectives
- Allow clients to submit feedback at any project stage
- Allow clients to request guidance/assistance after project completion
- Give clients a simple way to reach Vichakra

### Scope
| In | Out |
|----|-----|
| Project feedback form (rating + comments) | Full chat / messaging system |
| Post-project support ticket system | SLA tracking |
| "Approach Us" contact form in portal | Live chat widget |
| Support ticket list (client view) | Admin ticket queue UI (use email for now) |
| Admin can view all feedback | |

### Data Models

**Feedback:**
```js
{
  project: ObjectId (ref: Project),
  client: ObjectId (ref: User),
  rating: Number (1-5),
  communication: Number (1-5),
  quality: Number (1-5),
  timeliness: Number (1-5),
  comments: String,
  isPublic: Boolean,              // admin can make testimonial-worthy feedback public
  createdAt
}
```

**SupportTicket:**
```js
{
  client: ObjectId (ref: User),
  project: ObjectId (ref: Project),   // optional, null for pre-project
  subject: String,
  message: String,
  category: enum['guidance','bug','change-request','general'],
  status: enum['open','in-progress','resolved'],
  adminResponse: String,
  createdAt, updatedAt
}
```

### Steps
1. Create `models/Feedback.js` and `models/SupportTicket.js`
2. Create portal routes: `POST /api/portal/feedback`, `GET /api/portal/feedback/:projectId`
3. Create support routes: `POST /api/portal/support`, `GET /api/portal/support` (client's tickets), `PATCH /api/admin/support/:id` (admin responds)
4. Build `src/pages/portal/FeedbackPage.jsx` — star rating inputs (5 criteria) + comments textarea; show existing feedback if already submitted
5. Build `src/pages/portal/SupportPage.jsx` — ticket list + "New Request" form with category selector; show admin response inline when resolved
6. Build "Approach Us" section in `PortalDashboardPage.jsx` — quick contact form (even before project assignment)
7. Add `src/pages/admin/FeedbackPage.jsx` — all feedback table, rating averages, toggle `isPublic`
8. Add feedback + support tabs in admin `ProjectDetailPage.jsx`

### Risks & Constraints
- **Risk:** Clients submitting feedback before project is complete — allow feedback only when project status is `delivered` or `closed`; show guidance message otherwise
- **Risk:** Support ticket volume overwhelming without a queue — notify admin via console log + email (nodemailer) for now; proper queue is post-MVP
- **Constraint:** Admin responses are plain text only (no rich text editor) to keep Phase 8 scope tight

### What to Test
- [ ] Feedback form only appears for `delivered`/`closed` projects
- [ ] Rating 1-5 persists and displays correctly
- [ ] Client cannot submit feedback twice (form hides after submission)
- [ ] Support ticket appears in admin view immediately after submission
- [ ] Admin response updates ticket status and is visible to client
- [ ] "Approach Us" form submits even without an active project

---

## Phase 9 — Integration, Hardening & E2E Testing

> **Depends on:** All phases complete

### Objectives
- Connect all moving parts end-to-end
- Harden security, validate edge cases, fix integration bugs
- Ensure UI is pixel-consistent with existing site on all screen sizes

### Scope
| In | Out |
|----|-----|
| Full end-to-end user journey testing | Automated test suite (jest/cypress) |
| Input sanitization (server-side) | Performance profiling |
| Rate limiting on auth endpoints | SEO for portal/admin pages |
| HTTP security headers (helmet.js) | |
| Responsive QA: mobile, tablet, desktop | |
| Error boundary in React | |
| 404 and error pages for portal/admin | |
| Environment variable audit | |

### Steps
1. Install `helmet`, `express-rate-limit` on server — configure security headers + limit `/api/auth/login` to 10 req/15min per IP
2. Add `express-mongo-sanitize` to prevent NoSQL injection
3. Add React `<ErrorBoundary>` wrapper in `AdminLayout` and `PortalLayout`
4. Build `src/pages/NotFoundPage.jsx` and `src/pages/ErrorPage.jsx` styled to match site
5. Audit all API responses — ensure no passwords/tokens leak in any response body
6. Run full user journey manually:
   - Admin creates client → client receives credentials → client logs in → sees tutorial → submits requirements → admin views → marks acknowledged → updates project milestones → client sees progress → project delivered → client submits feedback → admin views feedback
7. Test all modals, forms, and file uploads on mobile (375px) and tablet (768px)
8. Verify all protected routes reject unauthorized access
9. Check all `.env` references work and document required variables in `server/README.md`

### Risks & Constraints
- **Risk:** Integration bugs between phases discovered late — mitigate by running cross-phase checks at end of each phase (not just Phase 9)
- **Risk:** File paths breaking on different OS (Windows backslash vs Unix forward slash) — use `path.join()` everywhere
- **Constraint:** No deploy config in this plan (per user instruction) — ensure all code works with `npm run dev` locally

### What to Test
- [ ] Full client lifecycle: create → login → requirements → progress → feedback
- [ ] Admin can manage clients, projects, files, and status updates without errors
- [ ] No 500 errors on any standard user action
- [ ] All forms reject empty/invalid inputs with helpful messages
- [ ] Auth tokens expire correctly and session restores on refresh
- [ ] Mobile layout: sidebar collapses, forms are usable, touch targets are adequate
- [ ] No `console.error` warnings in browser during normal flows

---

## Quick Reference: New Routes

### Server Routes
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | public | Login |
| POST | `/api/auth/refresh` | public | Refresh token |
| POST | `/api/auth/logout` | auth | Logout |
| GET | `/api/auth/me` | auth | Current user |
| GET | `/api/admin/stats` | admin | Dashboard stats |
| GET/POST | `/api/admin/clients` | admin | List / create clients |
| PUT/DELETE | `/api/admin/clients/:id` | admin | Edit / deactivate client |
| GET/POST | `/api/admin/projects` | admin | List / create projects |
| PUT/DELETE | `/api/admin/projects/:id` | admin | Edit / delete project |
| GET | `/api/admin/projects/:id/requirements` | admin | View requirements |
| POST | `/api/admin/files/upload` | admin | Upload file |
| GET/DELETE | `/api/admin/files/:id` | admin | Browse / delete file |
| GET/POST | `/api/admin/status-updates` | admin | Manage status updates |
| GET | `/api/admin/feedback` | admin | All feedback |
| PATCH | `/api/admin/support/:id` | admin | Respond to ticket |
| GET | `/api/portal/projects` | client | Their projects |
| GET | `/api/portal/status-updates` | client | Status feed |
| PATCH | `/api/portal/onboarding-complete` | client | Mark tutorial done |
| GET/POST/PATCH | `/api/portal/requirements` | client | Requirements CRUD |
| POST/GET | `/api/portal/feedback` | client | Submit / view feedback |
| POST/GET | `/api/portal/support` | client | Support tickets |

### Client React Routes
| Path | Component | Role |
|------|-----------|------|
| `/login` | LoginPage | public |
| `/admin` | Admin Dashboard | admin |
| `/admin/clients` | Clients List | admin |
| `/admin/clients/:id` | Client Detail | admin |
| `/admin/projects` | Projects List | admin |
| `/admin/projects/:id` | Project Detail | admin |
| `/admin/files` | File Manager | admin |
| `/admin/status` | Status Updates | admin |
| `/admin/feedback` | Feedback Viewer | admin |
| `/portal` | Portal Dashboard | client |
| `/portal/requirements` | Requirements Form | client |
| `/portal/support` | Support Tickets | client |
| `/portal/feedback` | Feedback Form | client |

---

## NPM Packages to Install

### Server
```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer express-validator morgan helmet express-rate-limit express-mongo-sanitize
npm install -D nodemon
```

### Client (additions to existing)
```bash
npm install axios
```

---

*Plan version: 1.0 · Author: Rohith · Date: 2026-04-11*
