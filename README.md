# CampusFix Lite

A minimal, working, end-to-end Campus Complaint Management System.

- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express
- **Database:** MongoDB (MongoDB Atlas or local)
- **Auth:** JWT + bcrypt (role-based: student / admin)
- **File upload:** Multer (stored locally under `backend/uploads`, served statically)
- **"AI" category suggestion:** offline keyword-matching engine (`backend/utils/categorySuggester.js`) —
  no external API key needed. Swap it for a real LLM call later without touching any route code.

## Project layout

```
campusfix-lite/
  backend/     Express API, MongoDB models, auth, complaint routes
  frontend/    React app (student + admin dashboards)
```

## 1. Backend setup

```bash
cd backend
cp .env.example .env       # then edit .env with your real MongoDB URI + JWT secret
npm install
npm run seed:admin         # creates one admin account from ADMIN_EMAIL/ADMIN_PASSWORD in .env
npm run dev                # starts on http://localhost:5050
```

You need a MongoDB connection string in `MONGO_URI`. The free tier of
[MongoDB Atlas](https://www.mongodb.com/atlas) works fine, or point it at a local `mongod`.

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env       # defaults to http://localhost:5000/api, change if needed
npm install
npm run dev                # starts on http://localhost:5173
```

## 3. Try it out

1. Open `http://localhost:5173/register` and create a student account.
2. Log in, raise a complaint — type a description and watch the AI hint suggest a category.
3. Log in as the admin account you seeded (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`) at
   `http://localhost:5173/login`.
4. On the admin board, filter by status/category, open a ticket, change its status, and add a remark.
   Log back in as the student to see the status and remark update.

### Demo login

The login screen includes a **Use demo login** button. After MongoDB is configured,
run `npm run seed:admin` in `backend` and use:

- Email: `demo.admin@campusfix.edu`
- Password: `CampusFix123!`

The default API port is `5050` because macOS commonly reserves port `5000` for AirPlay.

## How the pieces map to the spec

| Spec item | Where it lives |
|---|---|
| Unified login, registration | `backend/routes/authRoutes.js`, `frontend/src/pages/Login.jsx` / `Register.jsx` |
| Role-based dashboards | `frontend/src/pages/StudentDashboard.jsx`, `AdminDashboard.jsx`, guarded by `PrivateRoute.jsx` |
| Complaint submission (category, description, location, image) | `backend/routes/complaintRoutes.js` (`POST /`), `frontend/src/pages/RaiseComplaint.jsx` |
| Real-time-feeling status tracking | Complaints are re-fetched on load/update; `status` field drives the UI. (See "Notes on real-time" below.) |
| Admin filter/prioritize/approve/reject/progress/resolve | `GET /api/complaints` (filters), `PATCH /api/complaints/:id/status` |
| Timestamps & remarks | `Complaint.remarks[]` subdocument with `createdAt`, shown as a timeline in the detail drawer |
| AI category suggestion | `backend/utils/categorySuggester.js` + `POST /api/complaints/suggest-category`, wired into `RaiseComplaint.jsx` |

## Notes on "real-time"

The original brief mentions Firebase for real-time sync. This build uses MongoDB + a
conventional REST API instead (per your chosen stack), so status updates appear as soon as
the page re-fetches data (on load, after an admin action, etc.) rather than pushed instantly
over a socket. If you want true real-time updates later, the cleanest add-on is a WebSocket
layer (e.g. Socket.IO) that emits a `complaint:updated` event from the `PATCH` route — the
REST API and data model here don't need to change.

## Security notes for production

- Change `JWT_SECRET` to a long random value and never commit `.env`.
- Move image storage to a cloud bucket (S3/Cloudinary) instead of local disk if you deploy
  behind multiple server instances.
- Add rate limiting to `/api/auth/login` and `/api/auth/register`.
# Campus-Fix_LITE
