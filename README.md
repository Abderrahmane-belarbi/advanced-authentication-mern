# CrewAuth 🔐

CrewAuth is a production-style full-stack authentication app built with the MERN ecosystem.
It includes secure account flows such as email/password auth, Google OAuth, email verification,
password reset, protected sessions, and profile management.

---

## 📌 Overview

This project demonstrates real-world authentication patterns beyond simple login forms:

- Cookie-based JWT sessions
- Account verification and recovery by email
- OAuth with CSRF state protection
- Authentication metadata tracking (IP, browser, OS, device)
- Route guarding and session restoration in the frontend

CrewAuth works well as:

- A portfolio project
- A starter auth template for SaaS products
- A reference implementation for secure MERN authentication flows

---

## ✨ Features

### Authentication
- User registration with hashed passwords (`bcrypt`)
- Email verification via one-time code
- Resend verification code with cooldown
- Login/logout with JWT in `httpOnly` cookie
- Forgot password with expiring reset link
- Reset password using hashed token validation
- Google OAuth login/signup

### Security & Reliability
- JWT-protected private routes via middleware
- `httpOnly` cookie sessions with `sameSite` and production `secure` flag
- OAuth `state` cookie for CSRF mitigation
- Generic forgot-password responses to reduce account enumeration risk
- Password reset token stored hashed in database

### User Experience
- Frontend route protection and redirect logic
- Session check on app startup
- Validation utilities (including password criteria)
- Profile editing endpoint and UI
- Modern animated UI components

---

## 🧱 Tech Stack

### Frontend
- React 19 + Vite
- React Router
- Zustand (state management)
- Tailwind CSS 4
- Framer Motion
- Zod validation

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT + cookie-parser + CORS
- bcryptjs
- Google Auth Library + Google APIs (OAuth + Gmail API mail sending)
- UA Parser JS (auth metadata)

---

## 📁 Project Structure

```txt
.
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── src/
│   └── store/
├── .env.example
├── package.json
└── README.md
```
---

## Screenshots

### Home Page
![Home Page](./docs/images/home.png)

### Login Page
![Login Page](./docs/images/login.png)

### Signup Page
![Signup Page](./docs/images/register.png)

### Dashboard
![Dashboard](./docs/images/dashboard.png)

### Edit Profile Page
![Edit Profile Page](./docs/images/edit-profile.png)

### Forgot Password
![Forgot Password](./docs/images/forgot-password.png)

### Reset Password
![Reset Password](./docs/images/reset-password.png)

---

## 🚀 Getting Started

### 1) Prerequisites

- Node.js 20+
- npm 10+
- MongoDB (local or cloud)
- Google Cloud OAuth credentials (for Google login)
- Gmail API refresh token (if using Gmail for email delivery)

### 2) Install dependencies

From the repository root:

```bash
npm install
npm install --prefix frontend
```

### 3) Configure environment variables

The backend reads environment variables from the **root** `.env` file.

```bash
cp .env.example .env
```

Recommended backend variables:

| Variable | Purpose |
|---|---|
| `PORT` | Backend port (default `5000`) |
| `NODE_ENV` | Runtime mode (`development`/`production`) |
| `MODE` | App mode selector used by auth/config logic |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `CLIENT_URL` | Frontend origin allowed by CORS |
| `LOCAL_CLIENT_URL` | Local frontend URL used in links/redirects |
| `PUBLIC_CLIENT_URL` | Public frontend URL used in production links |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `LOCAL_GOOGLE_REDIRECT_URI` | Local OAuth callback URL |
| `PUBLIC_GOOGLE_REDIRECT_URI` | Production OAuth callback URL |
| `REFRESH_TOKEN` | Gmail API refresh token for sending emails |
| `EMAIL_FROM` | Sender email address |
| `VERIFICATION_RESEND_COOLDOWN_SECONDS` | Cooldown for verification code resend |

Frontend `VITE_*` variables should be placed in `frontend/.env` (or `frontend/.env.local`):

| Variable | Purpose |
|---|---|
| `VITE_API_REQUEST_TIMEOUT_MS` | Axios request timeout (ms) |
| `VITE_VERIFICATION_RESEND_COOLDOWN_SECONDS` | Client-side cooldown fallback |
| `VITE_RESEND_COOLDOWN_KEY` | Local storage key override |

### 4) Run in development

Start backend (port 5000) from repository root:

```bash
npm run dev
```

Start frontend (port 3000) in another terminal:

```bash
npm run dev --prefix frontend
```

### 5) Production build

From repository root:

```bash
npm run build
npm start
```

In production, Express serves the frontend build from `frontend/dist`.

---

## 📜 Available Scripts

From the repository root:

- `npm run dev` — start backend with nodemon
- `npm start` — start backend in production mode
- `npm run build` — install dependencies and build frontend bundle

From `frontend/`:

- `npm run dev` — start Vite dev server on port 3000
- `npm run build` — build frontend
- `npm run lint` — run ESLint
- `npm run preview` — preview the built frontend

---

## 🔌 Main API Routes

Base path: `/api/auth`

- `POST /signup`
- `POST /login`
- `POST /logout`
- `GET /check-auth`
- `POST /verify-email`
- `POST /resend-verification-email`
- `POST /forgot-password`
- `POST /reset-password/:token`
- `GET /google`
- `GET /google/callback`
- `PUT /update-profile`

> Exact request/response payloads are defined in the backend controllers and validators.

---

## 🔒 Authentication Flow (High Level)

1. User signs up with email/password or Google OAuth.
2. Backend validates input, stores user, and issues verification/reset flows as needed.
3. Authenticated sessions are maintained with JWT in `httpOnly` cookies.
4. Frontend checks session state on app startup and protects private routes.

---

## 🧪 Validation Checklist

After setup, verify these flows:

- Register → verify email → login
- Logout and session restoration behavior
- Forgot password → reset password
- Google OAuth login
- Protected route access (unauthenticated vs authenticated)
- Profile update for authenticated users

---

## 🛠️ Troubleshooting

- **CORS errors in browser**
  - Ensure `CLIENT_URL` matches your frontend origin (e.g., `http://localhost:3000`).
- **OAuth callback mismatch**
  - Confirm Google Console redirect URI matches `LOCAL_GOOGLE_REDIRECT_URI` (dev) or `PUBLIC_GOOGLE_REDIRECT_URI` (prod).
- **Emails not sending**
  - Re-check `REFRESH_TOKEN` and `EMAIL_FROM` values.
- **Cookies not persisting**
  - Validate frontend is sending credentials and backend CORS has `credentials: true`.

---

