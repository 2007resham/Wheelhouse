# WheelHouse

An urban bike rental platform — browse city, mountain, and electric bikes by station, book by the hour or day, and manage your rentals from a personal dashboard.

Built for a second-year front-end engineering group project. Vanilla HTML/CSS/JS on the frontend, Express + SQLite on the backend — no frameworks, no build step.

## Tech stack

- **Frontend:** HTML5, CSS3 (custom design system, Flexbox/Grid), vanilla JavaScript (ES6+, fetch API)
- **Backend:** Node.js + Express, REST API
- **Database:** SQLite via Node's built-in `node:sqlite` module — a single `wheelhouse.db` file, no external database server needed
- **Auth:** JWT + bcrypt password hashing

## Getting started

Requires **Node.js 22.5+** (for the built-in `node:sqlite` module).

```bash
npm install
cp .env.example .env      # then edit JWT_SECRET to a long random string
npm run seed               # creates wheelhouse.db and populates it with bikes, a demo user, and sample bookings/reviews
npm run dev                 # starts the server at http://localhost:3000
```

Then open `http://localhost:3000` in your browser.

**Demo accounts** (created by the seed script, password `password123` for both):
- `demo@wheelhouse.app` — regular user, has sample bookings and reviews
- `admin@wheelhouse.app` — admin, can access `/pages/admin.html` to manage the bike fleet and view all bookings

Re-running `npm run seed` is safe — it skips seeding if the `bikes` table already has data. To start over from an empty database, delete `wheelhouse.db` (and any `.db-shm`/`.db-wal` files next to it) and re-run the seed script.

## Project structure

```
/client
  /pages        one HTML file per page (login, signup, browse, bike-detail, booking, dashboard, admin)
  /css          design-system.css (shared variables + components) + one file per page
  /js           api.js (fetch wrapper), auth.js (nav/session), one file per page's logic
  index.html    landing page
/server
  /routes       Express route definitions
  /controllers  request handling + validation
  /models       SQL queries (the only files that talk to the database)
  /middleware   JWT auth middleware, centralized error handler
  db.js         SQLite connection + schema creation
  seed.js       demo data
  server.js     app entry point
wheelhouse.db   generated on first run — not committed to git
```

## API overview

| Endpoint | Auth | Description |
|---|---|---|
| `POST /api/auth/signup` | — | Create an account |
| `POST /api/auth/login` | — | Log in, returns a JWT |
| `GET /api/auth/me` | required | Current user's profile |
| `PUT /api/auth/me` | required | Update name/email |
| `GET /api/bikes` | — | List bikes (supports `type`, `location`, `maxPrice`, `search`, `sort` query params) |
| `GET /api/bikes/:id` | — | Bike detail |
| `POST /api/bikes` | admin | Add a bike |
| `PUT /api/bikes/:id` | admin | Edit a bike |
| `DELETE /api/bikes/:id` | admin | Remove a bike |
| `GET /api/bikes/:id/reviews` | — | Reviews for a bike |
| `POST /api/bikes/:id/reviews` | required | Leave a review |
| `POST /api/bookings` | required | Book a bike |
| `GET /api/bookings/me` | required | Your bookings |
| `GET /api/bookings` | admin | All bookings + fleet-wide stats |
| `DELETE /api/bookings/:id` | required | Cancel your own booking |

## Team roles

_Fill in names as the team divides up the work — the codebase is already split along these lines so each person can work independently:_

- **Person A — Auth + Dashboard:** `pages/login.html`, `pages/signup.html`, `pages/dashboard.html`, `js/auth.js`, `js/login.js`, `js/signup.js`, `js/dashboard.js`, `auth.controller.js`, `auth.routes.js`
- **Person B — Browse + Booking flow:** `pages/browse.html`, `pages/bike-detail.html`, `pages/booking.html`, `js/browse.js`, `js/bike-detail.js`, `js/booking.js`, `bookings.controller.js`, `reviews.controller.js`
- **Person C — Backend/API + Database:** `server/db.js`, `server/seed.js`, `/server/models`, `/server/middleware`, `server.js`
- **Person D — Landing/Admin + Design system:** `index.html`, `pages/admin.html`, `css/design-system.css`, `js/landing.js`, `js/admin.js`, `bikes.controller.js`

## Notes for contributors

- The database schema lives in `server/db.js` and runs automatically on server startup — no separate migration step.
- `client/js/api.js` is the only file that should call `fetch()` — every page script goes through its `api.get/post/put/delete` helpers so auth headers and error handling stay consistent.
- `client/js/auth.js` is included on every page and handles the logged-in/out nav state, the mobile menu, and the `requireLoggedIn()` / `requireAdmin()` guards used by protected pages.
