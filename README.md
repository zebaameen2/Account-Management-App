# 💰 Vault – Account Management System

A full-stack account management application with authentication, real-time balance, money transfers, and transaction history.

---

## Tech Stack

| Layer    | Technology                           |
|----------|--------------------------------------|
| Frontend | React 18, React Router v6, Axios     |
| Backend  | Node.js, Express.js                  |
| Database | Supabase (PostgreSQL)                |
| Auth     | JWT (JSON Web Tokens) + bcryptjs     |

---

## Project Structure

```
project/
├── frontend/          ← React app
│   └── src/
│       ├── context/   ← AuthContext (global state)
│       ├── components/← Sidebar, ProtectedRoute
│       └── pages/     ← Signup, Login, Dashboard, SendMoney, Statement
│
├── backend/           ← Express API
│   ├── controllers/   ← authController, accountController
│   ├── routes/        ← authRoutes, accountRoutes
│   ├── middlewares/   ← authMiddleware (JWT verify)
│   ├── config/        ← supabaseClient
│   └── utils/         ← generateToken
│
└── supabase_schema.sql ← Run this in Supabase SQL Editor
```

---

## Setup Guide

### Step 1 – Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **SQL Editor** and paste + run the contents of `supabase_schema.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon/public` key

---

### Step 2 – Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=pick_any_long_random_string
```

Start the server:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Server runs at `http://localhost:5000`

---

### Step 3 – Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the app:
```bash
npm start
```

App runs at `http://localhost:3000`

---

## API Reference

### Auth Routes

| Method | Endpoint          | Body                          | Description       |
|--------|-------------------|-------------------------------|-------------------|
| POST   | /api/auth/signup  | `{name, email, password}`     | Register user     |
| POST   | /api/auth/login   | `{email, password}`           | Login, get token  |

### Account Routes (protected – send `Authorization: Bearer <token>`)

| Method | Endpoint                | Body                              | Description             |
|--------|-------------------------|-----------------------------------|-------------------------|
| GET    | /api/account/balance    | —                                 | Get current balance     |
| GET    | /api/account/statement  | —                                 | Get transaction history |
| POST   | /api/account/transfer   | `{receiver_email, amount}`        | Transfer money          |
| GET    | /api/account/users      | —                                 | List all other users    |

---

## Features

- ✅ Signup with automatic ₹10,000 starting balance
- ✅ JWT login with token stored in localStorage
- ✅ Protected routes (redirect to login if not authenticated)
- ✅ Context API for global auth state
- ✅ Dashboard with balance + recent transactions
- ✅ Send money with live user search/autocomplete
- ✅ Account statement with credit/debit color coding
- ✅ Filter transactions by All / Received / Sent
- ✅ Balance after each transaction shown
- ✅ Loading and error states on all pages
- ✅ Responsive design

---

## Push to GitHub

```bash
git init
git add .
git commit -m "Completed Account Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
