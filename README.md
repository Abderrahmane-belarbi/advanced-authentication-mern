# CrewAuth

A production-style **MERN authentication system** with email verification, secure cookie-based JWT auth, password reset via email, and authentication activity metadata.

## Tech Stack

- **Frontend:** React + Vite + Zustand
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth/Security:** JWT (httpOnly cookie), bcrypt
- **Email:** Nodemailer (SMTP)
- **Validation:** Zod

## Features

- User registration with password hashing
- Email verification with one-time code + resend cooldown
- Login/logout with JWT stored in `httpOnly` cookie
- Protected auth-check endpoint (`/check-auth`)
- Forgot/reset password flow with expiring token links
- Auth metadata tracking (last login time, IP, browser, OS, device)

## Project Structure

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
│   ├── pages/
│   ├── store/
│   └── lib/
└── package.json
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/crewauth
JWT_SECRET=replace_with_a_strong_secret
CLIENT_URL=http://localhost:3000

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
MAIL_FROM="Auth <no-reply@example.com>"

# Optional: preferred for production on hosts that block SMTP ports
EMAIL_TRANSPORT=auto
# use resend|smtp|auto (auto = resend first when key exists, otherwise smtp)
RESEND_API_KEY=re_xxxxxxxxx
RESEND_EMAIL_FROM="Auth <onboarding@resend.dev>"

VERIFICATION_RESEND_COOLDOWN_SECONDS=60
```

## Local Development

### 1) Install dependencies

```bash
npm install
npm install --prefix frontend
```

### 2) Run frontend

```bash
npm run dev --prefix frontend
```

Frontend runs on `http://localhost:3000`.

### 3) Run backend

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

## Production Build

```bash
npm run build
npm start
```

In production, the Express server serves the built frontend from `frontend/dist`.

## API Endpoints

Base URL: `http://localhost:5000/api/auth`

- `GET /check-auth` (protected)
- `POST /signup`
- `POST /login`
- `POST /logout`
- `POST /verify-email`
- `POST /resend-verification-email`
- `POST /forgot-password`
- `POST /reset-password/:token`

## Security Notes

- Auth token is issued in an `httpOnly` cookie.
- `sameSite: "strict"` is used to reduce CSRF risk.
- Passwords are hashed with bcrypt.
- Password reset stores only a **hashed** reset token in the database.

## Quick Start Checklist

- [ ] Create `.env`
- [ ] Start MongoDB
- [ ] Run backend (`npm run dev`)
- [ ] Run frontend (`npm run dev --prefix frontend`)
- [ ] Register a user and verify email

---

If you want, I can next help you add:

1. badges,
2. deployment instructions (Render/Vercel),
3. architecture diagram,
4. sample `.env.example`,
5. contribution and license sections.
