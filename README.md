# FlatmateFinder

A full-stack flatmate and room rental web application built for **Nadiad, Gujarat**. It connects room seekers with providers through smart compatibility matching, a complete booking flow, and a role-based admin system.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Node.js, Express.js, MongoDB Atlas  |
| Frontend  | React 18, Vite, React Router v6     |
| Auth      | JWT (JSON Web Tokens), bcrypt       |
| Storage   | Multer (local file uploads)         |
| Database  | Mongoose ODM                        |

---

## Features

### Seeker
- Browse all available rooms with rent and gender filters
- Compatibility score (0–100%) based on lifestyle preferences
- Send requests to providers with move-in date and occupant count
- Unlock provider contact info after request is accepted
- Auto-created booking once provider accepts
- Write reviews after completed bookings
- Save favourite rooms
- Report users or rooms

### Provider
- Create room listings (flatmate search or full rental)
- City fixed to Nadiad — area is customisable
- View received requests with compatibility scores
- Accept / reject requests — booking auto-created on accept
- Room auto-marked **Occupied** when active bookings reach max occupants
- Darkened "Fully Occupied" overlay on room cards for all users

### Admin
- View all users, block accounts
- View and manage all reports
- Block users or rooms directly from report panel

### Role Switching
- Seekers can switch to provider (and back) from their profile
- A fresh JWT is issued on every role switch — no stale permissions

### Public Pages
- Landing page (Home), About, Contact with FAQ

---

## Project Structure

```
myapp/
├── app.js                  # Express app entry point
├── bin/www                 # HTTP server
├── controller/             # Route handlers
├── middleware/             # Auth, validation, upload, role guards
├── models/                 # Mongoose schemas
├── routes/                 # Express routers
├── utils/                  # Compatibility scoring algorithm
├── public/uploads/         # Uploaded room photos
└── client/                 # React + Vite frontend
    ├── src/
    │   ├── api/            # Axios instance with JWT interceptor
    │   ├── components/     # Navbar, PrivateRoute, ErrorBoundary
    │   ├── context/        # AuthContext (JWT-based)
    │   └── pages/
    │       ├── auth/       # Login, Register
    │       ├── public/     # Home, About, Contact
    │       ├── seeker/     # Rooms, RoomDetail
    │       ├── provider/   # MyRooms, RoomForm, Requests, Bookings
    │       ├── admin/      # AdminUsers, AdminReports
    │       └── Profile.jsx # Unified profile with sidebar (all sections)
    └── vite.config.js      # Proxy: /api → localhost:3000
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/flatmate-finder.git
cd flatmate-finder
```

### 2. Install backend dependencies
```bash
npm install
```

### 3. Install frontend dependencies
```bash
cd client
npm install
cd ..
```

### 4. Configure environment
The MongoDB connection string is currently hardcoded in `app.js`. For production, move it to a `.env` file:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 5. Run the app

**Terminal 1 — Backend (port 3000):**
```bash
npm start
```

**Terminal 2 — Frontend dev server (port 5173):**
```bash
cd client
npm run dev
```

Open **http://localhost:5173**

---

## Create Admin Account

Admin accounts require an `@admin.com` email. Run this once:

```bash
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect('YOUR_MONGO_URI').then(async () => {
  const User = require('./models/user');
  const hash = await bcrypt.hash('Admin@123', 10);
  await User.create({ name: 'Admin', email: 'admin@admin.com', password: hash, role: 'admin' });
  console.log('Admin created');
  process.exit(0);
});
"
```

Login at `/login` with `admin@admin.com` / `Admin@123`.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login, returns JWT |
| GET | `/api/rooms` | List all rooms |
| POST | `/api/rooms` | Create listing (provider) |
| POST | `/api/requests` | Send room request (seeker) |
| PUT | `/api/requests/:id/status` | Accept/reject request (provider) |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my-bookings` | Seeker's bookings |
| POST | `/api/reviews` | Submit review |
| GET | `/api/reports` | All reports (admin) |
| PUT | `/api/users/switch-role` | Switch seeker ↔ provider |

---

## License

MIT — free to use and modify.
