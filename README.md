# Northstar CRM — Full-stack CRM Management

A responsive CRM application built with React + Vite, Express, PostgreSQL, JWT authentication, bcrypt password hashing, Recharts and Lucide icons. It includes a clean blue-and-white business interface, lead pipeline, client directory, follow-ups, employee permissions and a database-backed dashboard.

> **Production note:** this is a functional starter implementation. Before public deployment, add your organisation's privacy/retention policy, automated database backups, HTTPS and reverse proxy, security review, monitoring, and a token-revocation/session strategy appropriate to your deployment. JWT logout is client-side token disposal (stateless API tokens remain valid until expiry).

## Requirements

- Node.js 20+ (LTS recommended)
- npm 10+
- PostgreSQL 14+

## 1. Create the database

Open `psql` or pgAdmin and run:

```sql
CREATE DATABASE crm_management;
```

The seed command applies `database/schema.sql` and creates the first admin account from environment variables. It is safe to run again; an existing admin email is not overwritten.

## 2. Configure environment variables

Copy `.env.example` to `backend/.env` (do not commit this file). Example Windows PowerShell:

```powershell
Copy-Item .env.example backend/.env
```

Edit `backend/.env` and set a real local PostgreSQL password and a long random JWT secret (at least 32 characters):

```dotenv
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_LOCAL_PASSWORD@localhost:5432/crm_management
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters_long
JWT_EXPIRES_IN=8h
CLIENT_ORIGIN=http://localhost:5173
ADMIN_NAME=CRM Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisPassword123!
```

Choose a unique admin password for your machine. The values above are examples only, not preconfigured credentials. The app will refuse to start if `DATABASE_URL` or a sufficiently long `JWT_SECRET` is missing.

## 3. Install dependencies and initialise database

From the `crm-management` root folder:

```bash
npm install
npm run seed --workspace backend
```

The seed script applies the schema and creates the admin user. Optional sample records are not inserted by default; dashboard counts start at zero until you create records.

## 4. Run locally

Run both servers from the root folder:

```bash
npm run dev
```

Or in separate terminals:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Open **http://localhost:5173**. Sign in using the admin email/password you put in `backend/.env`.

Backend health check: http://localhost:5000/api/health

## 5. Build and test

```bash
npm test
npm run build
```

`npm test` runs the backend's validation and password-hashing unit tests. For the PostgreSQL-backed API, start the database and backend and verify `/api/health` returns `{ "success": true, "data": { "api": "ok", "database": "connected" } }`.

## Features

- **Authentication:** email/password login, bcrypt (12 rounds for new account passwords), JWT bearer tokens, `/auth/me`, logout, auth rate limit, Helmet, CORS and backend authorization middleware.
- **Roles:** Admin can manage employees, assign leads and delete leads. Employees can see/update their assigned leads and their follow-up notes. Backend enforces role and record ownership; hiding a UI route is not the only permission control.
- **Dashboard:** live database counts for lead statuses, clients and active employees, lead status distribution chart, recently updated leads and upcoming follow-ups.
- **Leads:** create, list, search, filter by status/employee/date, pagination, edit, detail/activity view, notes, follow-up history, status updates, admin deletion and lead-to-client conversion. Conversion is transactional and protected from duplicate conversion.
- **Clients:** search, create, edit and client detail pages.
- **Employees:** admin-only employee creation, edit, activation/deactivation and assigned-lead counts.
- **Follow-ups:** schedule, complete/reopen, delete, overdue highlighting and lead detail history.
- **Profile:** edit own profile and change password.
- **Responsive UI:** desktop/tablet/mobile layouts, loading/empty/error states and CSV export of the currently loaded leads page.

## API overview

All routes are under `/api`. Protected routes require `Authorization: Bearer <token>`.

| Area | Routes |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Dashboard | `GET /dashboard/stats`, `GET /dashboard/recent-leads`, `GET /dashboard/upcoming-followups` |
| Leads | `GET/POST /leads`, `GET/PUT/DELETE /leads/:id`, `PATCH /leads/:id/status`, `PATCH /leads/:id/assign`, `POST /leads/:id/notes`, `POST /leads/:id/convert` |
| Clients | `GET/POST /clients`, `GET/PUT /clients/:id` |
| Employees (admin) | `GET/POST /employees`, `PUT /employees/:id`, `PATCH /employees/:id/status` |
| Follow-ups | `GET/POST /followups`, `PUT/DELETE /followups/:id` |
| Profile | `GET/PUT /profile`, `POST /profile/password` |

Lead listing supports `page`, `limit`, `search`, `status`, `employee`, `from`, `to`, `sort` and `order` query parameters. SQL values are parameterized; sort fields are allow-listed.

## Database model

`users`, `leads`, `clients`, `follow_ups`, `lead_notes` and `activity_logs`, with foreign keys, constraints and indexes. The schema uses UUID primary keys and timestamps. Lead conversion is wrapped in a transaction and uses a unique `clients.lead_id` relationship.

## Troubleshooting

- **Database connection refused:** make sure PostgreSQL is running and `DATABASE_URL` has the correct host, port, username, password and database.
- **Database does not exist:** create `crm_management` before running the seed command.
- **Missing JWT secret:** check that `backend/.env` exists and includes a secret at least 32 characters long.
- **CORS error:** set `CLIENT_ORIGIN` to the exact frontend origin (normally `http://localhost:5173`).
- **Login rejected:** verify the admin email/password in `backend/.env`; the seed script intentionally does not overwrite an existing email's password. For a reset, update that account through a separate secure admin workflow or create a new admin email in the environment and seed again.
- **Port already in use:** change `PORT` in `backend/.env`, and set `VITE_API_URL` in `frontend/.env` if the API port changes, for example `VITE_API_URL=http://localhost:5001/api`.

## Manual end-to-end test checklist

1. Seed an admin and sign in; invalid credentials should return 401.
2. Create an employee with a strong password; sign in as that employee in a separate browser profile.
3. Create a lead, refresh the page, and verify it remains in PostgreSQL.
4. Search and filter leads; verify pagination and status badges.
5. Assign a lead to an employee; employee should access their assigned lead and receive 403/404 for restricted records or admin operations.
6. Add a note and schedule a follow-up; verify timestamps and overdue/completed states.
7. Convert a lead to a client twice; the second request should return the existing client rather than duplicate it.
8. Deactivate an employee; subsequent authentication should be rejected.
9. Update profile/password and verify login with the new password.
10. Run `npm test` and `npm run build`.
