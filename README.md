# Personal Portfolio (MERN)

A responsive personal portfolio for Md. Shahriar Chy Shajid, a CSE graduate
focused on software quality assurance and full-stack development. Projects are
managed from a secure admin dashboard, so adding or editing one never requires
changing source code.

- Live site: https://portfolio-seven-ecru-pjypgstth7.vercel.app/
- API health check: https://portfolio-api-x7ny.onrender.com/api/health
- Screenshots: _to be added (save images in `docs/screenshots/`)

## Features

- Responsive, monochrome design with a light and dark theme (follows the system
  setting on first visit, then remembers the choice, with no flash of the wrong theme)
- Sections: Home, About, Skills, Projects, Contact
- Project gallery loaded from MongoDB, with separate "View Code" and "Live Demo"
  links and honest fallbacks when a link or image is missing
- "More on GitHub" list from the GitHub API, fetched and cached by the server
- Contact form with client and server validation, rate limiting, a spam-trap
  field, and email delivery through Resend
- CV download button (shown only when a real PDF is configured)
- Admin dashboard at `/admin`: login, logout, create, edit, delete (with
  confirmation), publish or unpublish, feature, and display order
- Accessibility basics: skip link, visible focus, semantic landmarks, keyboard
  support, labeled form fields, reduced-motion support

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, lucide-react |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas (free tier) |
| Auth | express-session with connect-mongo, bcryptjs, csrf-sync |
| Security | helmet, cors, express-rate-limit |
| Email | Resend HTTP API |
| Tests | Node built-in test runner and supertest |
| Hosting | Vercel (frontend), Render (backend), Atlas (database) |

## How it fits together

```
Browser ──► Vercel (React site)
              │  /api/* is forwarded by vercel.json
              ▼
            Render (Express API) ──► MongoDB Atlas
              ├──► GitHub public API (cached)
              └──► Resend (contact email)
```

The browser only ever talks to one address (the Vercel site). Vercel forwards
`/api` requests to Render, so the admin login cookie is first-party. In
development, the Vite dev server does the same forwarding to `localhost:5000`.

## Prerequisites

- Node.js 24 (the project was built and tested on it)
- Git
- A free MongoDB Atlas cluster and a database user
- Optional: a free Resend account for contact email

## Local setup

```powershell
git clone https://github.com/Mr-Shajid/Portfolio.git
cd Portfolio

cd server
npm install
copy .env.example .env
# edit server/.env (see the variables table below)

cd ..\client
npm install
```

The client needs no `.env` file.

### Server environment variables (`server/.env`, never commit this file)

| Variable | Purpose | Safe to expose? |
|---|---|---|
| `PORT` | Port the API listens on (default 5000 locally; Render sets its own) | Yes |
| `NODE_ENV` | `development` locally, `production` on the host | Yes |
| `MONGODB_URI` | MongoDB connection string, includes the database password | **No** |
| `MONGODB_URI_TEST` | Same cluster, database name ending in `_test` (tests only) | **No** |
| `FRONTEND_URL` | The one website allowed to call the API through CORS | Yes |
| `SESSION_SECRET` | Signs the login cookie | **No** |
| `TRUST_PROXY_HOPS` | Production only: number of proxies in front of the server (currently 2) | Yes |
| `GITHUB_USERNAME` | Whose public repositories to list | Yes |
| `GITHUB_TOKEN` | Optional, read-only, public-data token that raises the GitHub rate limit | **No** |
| `RESEND_API_KEY` | Email provider key | **No** |
| `CONTACT_TO_EMAIL` | Where contact messages are delivered | Private |
| `CONTACT_FROM_EMAIL` | Sender shown on those emails | Yes |

Generate a session secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Create the admin account (one time)

There is no registration page. From `server/`:

```powershell
npm run create-admin
```

Enter an email and a password of 12 or more characters. The script refuses to
run if an admin already exists, so it can never overwrite one. For recovery,
see [MAINTENANCE.md](MAINTENANCE.md).

## Run locally

Two terminals:

```powershell
cd server
npm run dev
```

```powershell
cd client
npm run dev
```

- Site: http://localhost:5173
- Admin: http://localhost:5173/admin
- API health: http://localhost:5173/api/health (forwarded to port 5000)

Open the site as `localhost`, not `127.0.0.1`.

Local development uses the same database as the live site unless you point
`MONGODB_URI` elsewhere, so projects you publish locally appear on the live site.

## Tests

```powershell
cd server
npm test
```

Tests use a separate database (`MONGODB_URI_TEST`) and refuse to run against any
database whose name does not end in `_test`. The email service and GitHub API are
replaced with fakes, so no real emails are sent and GitHub is not called.

Frontend checks: `npm run lint` and `npm run build` in `client/`.

## Project structure

```
client/
  public/                favicon, robots.txt, sitemap.xml, theme-init.js, CV PDF
  src/
    api/                 fetch helpers (all use relative /api addresses)
    components/          public site sections
    config/site.js       name, text, skills, CV setting
    context/ hooks/      login state, small helpers
    pages/               Home, NotFound
    pages/admin/         login, dashboard, project form
    utils/               URL safety check
  vercel.json            API forwarding, page-refresh fix, security headers
  vite.config.js         dev and preview forwarding of /api
server/
  src/config/            database and session setup
  src/controllers/       request handling
  src/middleware/        auth, CSRF, error handling
  src/models/            Project, Admin
  src/routes/            URL definitions
  src/scripts/           create-admin, seed
  src/utils/             URL validation, email sending
  tests/                 automated tests
```

## API overview

| Method and path | Access |
|---|---|
| `GET /api/health` | Public |
| `GET /api/projects` | Public, published projects only |
| `GET /api/github/repos` | Public, cached for 10 minutes |
| `POST /api/contact` | Public, rate limited |
| `GET /api/auth/csrf-token`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Session and CSRF token |
| `GET/POST /api/admin/projects`, `GET/PATCH/DELETE /api/admin/projects/:id` | Admin only, CSRF token on changes |

## Deployment

| Part | Service | Key settings |
|---|---|---|
| Database | MongoDB Atlas (Mumbai) | A separate database user for production, limited to the `portfolio` database. Network access lists Render's outbound ranges. |
| Backend | Render free web service (Singapore) | Root directory `server`, build `npm install`, start `npm start`, health check `/api/health`, environment variables from the table above |
| Frontend | Vercel Hobby | Root directory `client`, framework Vite, no environment variables, `client/vercel.json` forwards `/api` to the backend |
| Email | Resend | Test sender `onboarding@resend.dev`, delivery to the account email |

Atlas network access at deployment time held two ranges from Render's dashboard
(Connect, then Outbound): `74.220.52.0/24` and `74.220.60.0/24`. Render has
changed its ranges before, so recheck them if the database connection ever fails.

Pushing to `main` redeploys both hosts.

## Security notes and known limitations

- Passwords are hashed with bcrypt. Sessions are stored in MongoDB and destroyed
  on logout. The cookie is HttpOnly, Secure in production, and SameSite=Lax.
- Every API response is marked `no-store`, and the frontend host is told not to
  cache proxied API responses.
- Rate limits and the GitHub cache are kept in server memory. They reset on every
  restart or wake-up, and there is no shared store.
- One admin only, no password-change screen, no two-factor login.
- The contact form has no CSRF token because it is a public form. It is
  protected by rate limiting, a spam-trap field, size limits and validation.
  Messages are not stored, so a failed email send loses the message.
- Contact email uses Resend's shared test sender until a domain is verified, so
  messages may land in spam.
- The free Render service sleeps after inactivity. The first request afterwards
  took roughly 25 seconds in testing, and the site shows a waiting message.
- The Content Security Policy allows inline styles and any HTTPS image source
  (project screenshots can be hosted anywhere).
- Anonymous GitHub API calls from a shared host IP can hit the rate limit. The
  optional `GITHUB_TOKEN` raises it, and the site degrades gracefully without it.
- `npm audit` reports a moderate advisory in `minimatch`, reached only through
  ESLint (a development tool). The production dependencies report none.
- No social preview image has been added yet.
- No system is perfectly secure. This list is a record of the controls in place,
  not a guarantee.
