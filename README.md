# TaskPlanet Social

A full-stack social platform with real-time interactions, points wallet mechanics, stories, poll voting, and a premium responsive UI

## Overview

TaskPlanet Social includes:

- JWT-based authentication (signup/login)
- Feed with post creation, likes, comments, and poll voting
- Stories with view tracking and expiry
- Follow/friend request system
- Points and wallet conversion flow
- Real-time notifications using Socket.IO
- Responsive frontend with premium UI components and animations

Tech stack:

- Frontend: React, Vite, React Router, Axios, Socket.IO client, React Hot Toast
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Socket.IO

---

## Project Structure

```text
taskplanet-social/
  backend/
    config/
    middleware/
    models/
    routes/
    server.js
    socket.js
    package.json
  frontend/
    src/
      api/
      components/
      context/
      pages/
      styles.css
      premium.css
      responsive.css
      nav.css
      notif.css
      App.jsx
      main.jsx
    package.json
    vite.config.js
```

---

## Features

### Authentication

- Signup with username/email/password
- Login with email/password
- JWT token returned from backend and stored in localStorage
- Protected routes for main app pages

### Feed

- Create text/image posts
- Promotion post mode
- Like/unlike posts with optimistic updates
- Add comments
- Filter tabs: all, foryou, liked, commented, shared
- Incremental pagination (load more)

### Polls

- Create polls while posting (`pollOptions`)
- Vote on poll options
- Single active vote per user per poll (re-voting switches option)
- Display vote count and percentage per option

### Stories

- Create story with image URL and caption
- Story bar + viewer
- Mark story as viewed
- Story expiry handled via model logic

### Social Graph

- Follow/unfollow users
- Friend request send/accept/decline
- Pending friend requests panel
- “People you may know” suggestions

### Points & Wallet

- Points awarded for actions (`create_post`, `comment`, `like_post`, etc.)
- Points history endpoint
- Wallet endpoint with INR conversion (`100 points = 1 INR`)

### Real-time (Socket.IO)

- Online/offline user status
- Friend request and acceptance notifications
- Like/comment notifications
- Notification dropdown in UI

### UI / UX

- Premium auth pages with tabbed Sign In / Create Account
- Animated feed cards, story rings, shimmer skeletons
- Responsive behavior for desktop/tablet/mobile

---

## Backend

### Important Files

- `backend/server.js`: Express app setup, CORS, route mounting, health check, Socket.IO init
- `backend/socket.js`: Realtime events and online user map
- `backend/config/db.js`: MongoDB connection helper
- `backend/middleware/authMiddleware.js`: JWT validation

### API Routes

Base URL: `/api`

- Auth
  - `POST /auth/signup`
  - `POST /auth/login`
- Posts
  - `GET /posts`
  - `POST /posts`
  - `PUT /posts/:id/like`
  - `POST /posts/:id/comment`
  - `POST /posts/:id/poll/vote`
- Points
  - `POST /points/add`
  - `GET /points/history`
- Wallet
  - `GET /wallet`
  - `PUT /wallet/convert`
- Friends
  - `POST /friends/request/:userId`
  - `PUT /friends/accept/:friendshipId`
  - `PUT /friends/decline/:friendshipId`
  - `GET /friends/pending`
  - `GET /friends/list`
- Follow
  - `POST /follow/:userId`
  - `GET /follow/:userId/stats`
- Stories
  - `GET /stories`
  - `POST /stories`
  - `PUT /stories/:id/view`
  - `DELETE /stories/:id`
- Users
  - `GET /users/profile/:username`
- Health
  - `GET /health`

### Backend Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
```

---

## Frontend

### Important Files

- `frontend/src/main.jsx`: App bootstrapping and providers
- `frontend/src/App.jsx`: Route definitions and top-level providers
- `frontend/src/pages/Home.jsx`: Feed orchestration and handlers
- `frontend/src/components/`: UI building blocks
- `frontend/src/context/`: Auth, Points, Socket, Theme contexts
- `frontend/src/api/axios.js`: Axios base config and auth token interceptor

### Frontend Environment Variables

Create `frontend/.env` (optional for local if backend is default localhost):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Local Development

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Run backend

```bash
cd backend
npm run dev
```

### 3. Run frontend

```bash
cd frontend
npm run dev
```

Default ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

## Build

Frontend production build:

```bash
cd frontend
npm run build
```

Backend production start:

```bash
cd backend
npm start
```

---

## Deployment Notes

1. Set backend env variables (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`).
2. Set frontend env variable `VITE_API_URL` to deployed backend API URL.
3. Ensure CORS origin matches deployed frontend domain.
4. Build frontend (`npm run build`) and serve static build on your host/CDN.
5. Keep backend as long-running Node process (PM2, container, or cloud service).

---

## Poll System Behavior

Current poll behavior:

- Poll options are saved as objects:
  - `{ text: string, voters: string[] }`
- Vote API enforces one vote per user per poll.
- Re-voting changes the selected option.
- UI displays:
  - Total votes
  - Per-option vote count
  - Per-option percentage
  - Selected option highlight

---

## Responsive Checklist (Pre-Deploy)

Already handled in current UI:

- Navbar mobile mode with search + hamburger
- Sidebar collapse on tablet/mobile
- Compose action wrapping on small screens
- Poll option text/stat truncation on narrow screens
- Auth page corner branding and compact card sizing for small devices
- Horizontal overflow guard (`overflow-x: hidden`)

---

## Known Notes

- The styling layer has multiple theme/auth style blocks accumulated over iterations. Behavior is stable, but future cleanup into modular CSS files is recommended for maintainability.
- Socket notifications rely on user online presence events (`user:online`) and correct `userId` from auth context.

---

## Suggested Next Improvements

- Add automated tests (API + component tests)
- Add linting/prettier configs for consistency
- Add migration script for any legacy poll data if needed
- Add Docker setup for one-command deployment

---

## License

Private/internal project (no license declared yet). Add one before public distribution.
