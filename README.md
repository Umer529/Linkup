# LinkUp

A full-stack social activity platform for discovering, creating, and joining real-world events. Built with React + TypeScript on the frontend and Node.js/Express on the backend, powered by Supabase (PostgreSQL + Auth + Realtime).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Database Schema](#database-schema)
- [Backend — Files & Functions](#backend--files--functions)
- [Frontend — Files & Functions](#frontend--files--functions)
- [Data Flows](#data-flows)
- [Environment Variables](#environment-variables)
- [Setup & Running](#setup--running)

---

## Overview

LinkUp is an **activity-first platform** that puts real-world events at the center. Users can browse upcoming activities filtered by category, city, and difficulty, join or host events, chat with participants in real time, and even start peer-to-peer video calls within an activity group — all without needing a traditional social graph.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| State / Data | React Query (TanStack Query v5) |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (Email OTP + Google OAuth) |
| Realtime | Supabase Realtime (chat & WebRTC signaling) |
| Video | WebRTC (peer-to-peer, STUN via Google) |
| HTTP Client | Axios |
| Build | Vite |

---

## Project Structure

```
LinkUp/
├── backend/
│   ├── controllers/          # Request handlers
│   ├── models/               # Database query layer
│   ├── routes/               # Express route definitions
│   ├── middleware/           # Auth middleware
│   ├── database/             # Supabase client + SQL schema
│   └── index.js              # Server entry point
└── linkup-activities/
    └── src/
        ├── pages/            # Page-level components
        ├── components/       # Reusable UI components
        ├── hooks/            # Custom React Query hooks
        ├── context/          # Auth context provider
        ├── lib/              # api.ts, types.ts, supabase.ts
        └── App.tsx           # Root component + routing
```

---

## Features

- **Email OTP & Google OAuth** authentication
- **Browse & filter** activities by category, city, difficulty, and keyword search
- **Create activities** with a 4-step guided form wizard
- **Join / leave** activities with automatic capacity enforcement
- **Save / unsave** activities as bookmarks
- **Reviews** — 1–5 star rating with comments per activity
- **Real-time group chat** per activity (Supabase Realtime)
- **Peer-to-peer video calls** per activity group (WebRTC + Supabase signaling)
- **Notification system** — in-app notifications for joins, activity creation, etc.
- **User profiles** with hosted / joined / saved / past activity tabs
- **Auto-cleanup** — activities older than 7 days are deleted automatically
- **Admin dashboard** for platform management

---

## Database Schema

All tables live in PostgreSQL (Supabase). RLS is disabled; access control is handled in the Express middleware.

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `users` | id (UUID), name, avatar, bio, interests[], streak, activities_hosted, activities_joined | User profiles |
| `activities` | id, title, description, category, date, time, city, location, banner_image, host_id, participant_limit, current_participants, difficulty, tags[], is_public, safety_instructions, agenda[], rules[], required_items[] | Events/activities |
| `categories` | id, name, icon, color, count | Activity categories |
| `participants` | activity_id, user_id, joined_at — UNIQUE(activity_id, user_id) | Activity membership |
| `saved_activities` | activity_id, user_id, saved_at — UNIQUE(activity_id, user_id) | Bookmarked activities |
| `reviews` | id, activity_id, user_id, rating (1–5), comment — UNIQUE(activity_id, user_id) | Activity reviews |
| `messages` | id, activity_id, user_id, content, created_at | Chat messages |
| `calls` | id, activity_id, host_id, status (waiting/active/ended) | Video call sessions |
| `signals` | id, call_id, type (offer/answer/candidate), data (JSONB) | WebRTC signaling |
| `notifications` | id, user_id, type, title, message, activity_id, actor_id, is_read | In-app notifications |

**Trigger:** `update_participant_count()` automatically increments/decrements `activities.current_participants` on participant insert/delete.

---

## Backend — Files & Functions

### `backend/index.js`
Entry point. Mounts all route groups and starts a **24-hour cleanup job** (`runCleanup()`) that deletes activities older than 7 days.

### `backend/database/client.js`
Exports two Supabase clients:
- `supabase` — service-role client (bypasses RLS), used by all models
- `supabaseAuth` — anon client, used only for OTP operations

### `backend/middleware/authenticate.js`
- **`authenticate(req, res, next)`** — Reads the `Authorization: Bearer <token>` header, verifies it via Supabase Auth, and attaches the decoded user to `req.user`. Returns 401 if missing or invalid.

---

### Controllers

#### `authController.js`
| Function | What it does |
|----------|-------------|
| `sendOtp(email)` | Calls Supabase Auth to send an email OTP |
| `verifyOtp(email, token)` | Validates OTP, upserts a row in `users`, returns access + refresh tokens |
| `refresh(refresh_token)` | Exchanges a refresh token for a new session |
| `me(req)` | Returns the authenticated user's profile; creates the `users` row on first Google OAuth login |

#### `activityController.js`
| Function | What it does |
|----------|-------------|
| `getAll(filters)` | Returns upcoming activities (today onwards) filtered by category, city, difficulty, search, is_public |
| `getOne(id)` | Returns a single activity with host user data |
| `create(payload)` | Creates an activity, auto-joins the creator as a participant, sends a "your activity is live" notification |
| `update(id, payload)` | Updates activity fields — host only |
| `remove(id)` | Deletes an activity — host or admin only |
| `getByHost(userId)` | Returns all activities hosted by a user |

#### `participantController.js`
| Function | What it does |
|----------|-------------|
| `join(id)` | Adds the authenticated user as a participant; checks capacity; sends a notification to the host |
| `leave(id)` | Removes the authenticated user from participants |
| `getParticipants(id)` | Returns the full participant list with user data |
| `saveActivity(id)` | Bookmarks an activity for the user |
| `unsaveActivity(id)` | Removes a bookmark |

#### `notificationController.js`
| Function | What it does |
|----------|-------------|
| `getAll()` | Returns all notifications for the authenticated user, ordered by date DESC |
| `markRead(id)` | Marks a single notification as read |
| `markAllRead()` | Marks every notification for the user as read |

#### `chatController.js`
| Function | What it does |
|----------|-------------|
| `getMessages(activityId)` | Returns chat history — requires user to be a participant |
| `sendMessage(activityId, content)` | Inserts a message — requires user to be a participant |

#### `callController.js`
| Function | What it does |
|----------|-------------|
| `startCall(activityId)` | Creates a call record and sets status to `active` — host only |
| `getCall(activityId)` | Returns the active call for an activity |
| `endCall(callId)` | Sets call status to `ended` |
| `sendSignal(callId, type, data)` | Inserts a WebRTC signal (offer / answer / ICE candidate) |
| `getSignals(callId)` | Returns all signals for a call |

#### `userController.js`
| Function | What it does |
|----------|-------------|
| `getOne(id)` | Returns user profile including reviews |
| `create(payload)` | Creates a new user row |
| `update(id, payload)` | Updates profile — authenticated user only |
| `getSaved(id)` | Returns saved activities — authenticated user only |
| `getJoined(id)` | Returns joined activities (last 7 days) — authenticated user only |

#### `categoryController.js`
| Function | What it does |
|----------|-------------|
| `getAll()` | Returns all categories with live activity counts |
| `create(payload)` | Creates a new category |

#### `reviewController.js`
| Function | What it does |
|----------|-------------|
| `getByActivity(activityId)` | Returns reviews for an activity with user data |
| `create(payload)` | Creates a review (one per user per activity) |
| `remove(reviewId)` | Deletes a review — author only |

---

### Models (`backend/models/`)

Each model file is a thin database query layer called only by controllers.

| Model | Key functions |
|-------|--------------|
| `activityModel.js` | `findAll(filters)`, `findById(id)`, `create`, `update`, `remove`, `findByHost`, `deleteExpired` |
| `userModel.js` | `findById`, `create`, `update`, `getSavedActivities` |
| `participantModel.js` | `join`, `leave`, `getByActivity`, `isParticipant`, `getJoinedActivities` |
| `categoryModel.js` | `findAll`, `create` — plus `CATEGORY_META` fallback map for icons/colors |
| `notificationModel.js` | `create`, `getForUser(userId, limit)`, `markRead`, `markAllRead` |
| `chatModel.js` | `getMessages`, `create`, `isParticipant` |
| `callModel.js` | `createCall`, `getCallByActivity`, `updateCallStatus`, `createSignal`, `getSignalsByCall` |
| `reviewModel.js` | `findByActivity`, `create`, `remove` |

---

### API Routes

#### Auth — `/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/send-otp` | — | Send email OTP |
| POST | `/verify-otp` | — | Verify OTP, return tokens |
| POST | `/refresh` | — | Refresh session |
| GET | `/me` | ✓ | Get current user profile |

#### Activities — `/activities`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List activities (with filters) |
| GET | `/:id` | — | Get activity |
| POST | `/` | ✓ | Create activity |
| PUT | `/:id` | ✓ | Update activity (host) |
| DELETE | `/:id` | ✓ | Delete activity (host/admin) |
| GET | `/:id/participants` | — | List participants |
| POST | `/:id/join` | ✓ | Join activity |
| DELETE | `/:id/leave` | ✓ | Leave activity |
| POST | `/:id/save` | ✓ | Save activity |
| DELETE | `/:id/save` | ✓ | Unsave activity |
| GET | `/:id/reviews` | — | Get reviews |
| POST | `/:id/reviews` | ✓ | Create review |
| DELETE | `/:id/reviews/:reviewId` | ✓ | Delete review |
| GET | `/:id/messages` | ✓ | Get chat messages |
| POST | `/:id/messages` | ✓ | Send chat message |

#### Users — `/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/:id` | — | Get user profile |
| POST | `/` | — | Create user |
| PUT | `/:id` | ✓ | Update user (self only) |
| GET | `/:id/saved` | ✓ | Get saved activities |
| GET | `/:id/joined` | ✓ | Get joined activities |
| GET | `/:userId/activities` | — | Get hosted activities |

#### Notifications — `/notifications`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✓ | Get user notifications |
| PATCH | `/:id/read` | ✓ | Mark notification read |
| PATCH | `/read-all` | ✓ | Mark all notifications read |

#### Calls — `/calls`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/activity/:activityId/start` | ✓ | Start video call (host) |
| GET | `/activity/:activityId` | — | Get active call |
| PUT | `/:callId/end` | ✓ | End call |
| POST | `/:callId/signal` | ✓ | Send WebRTC signal |
| GET | `/:callId/signals` | — | Get signals |

#### Categories — `/categories`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List categories |
| POST | `/` | ✓ | Create category |

---

## Frontend — Files & Functions

### `src/App.tsx`
Root component. Configures `QueryClient` (30s stale time, 1 retry), wraps the app in `AuthProvider`, and defines all routes via `BrowserRouter`. Protected routes use the `ProtectedRoute` wrapper.

**Routes:** `/` · `/explore` · `/activity/:id` · `/activity/:id/chat` · `/activity/:id/video` · `/login` · `/verify` · `/auth/callback` · `/create` · `/profile` · `/admin`

---

### Context

#### `src/context/AuthContext.tsx`
Global authentication state.

| Export | Description |
|--------|-------------|
| `AuthProvider` | Wraps the app; manages `user`, `token`, `isLoading` state |
| `useAuth()` | Hook to read auth state from anywhere |
| `login(accessToken, refreshToken)` | Saves tokens to localStorage, fetches and sets user profile |
| `logout()` | Clears localStorage, resets state |

On mount, reads existing token from localStorage and re-fetches the user profile. Also listens to Supabase `SIGNED_OUT` events to auto-logout.

---

### Library (`src/lib/`)

#### `api.ts`
Axios instance with `VITE_API_URL` base URL. A **request interceptor** automatically attaches the stored Bearer token to every request.

Exports thin wrappers for every API endpoint:

| Group | Functions |
|-------|-----------|
| Auth | `sendOtp`, `verifyOtp`, `refreshToken`, `fetchMe` |
| Activities | `fetchActivities`, `fetchActivity`, `createActivity`, `updateActivity`, `deleteActivity` |
| Participants | `joinActivity`, `leaveActivity`, `saveActivity`, `unsaveActivity`, `fetchParticipants` |
| Reviews | `fetchReviews`, `createReview`, `deleteReview` |
| Categories | `fetchCategories` |
| Users | `fetchUser`, `updateUser`, `fetchUserActivities`, `fetchSavedActivities`, `fetchJoinedActivities` |
| Chat | `fetchMessages`, `sendMessage` |
| Notifications | `fetchNotifications`, `markNotificationRead`, `markAllNotificationsRead` |
| Calls | `startCall`, `getCall`, `endCall`, `sendSignal`, `getSignals` |

#### `types.ts`
TypeScript interfaces: `Activity`, `User`, `Badge`, `Category`, `Review`, `Message`, `Notification`

#### `supabase.ts`
Initializes the Supabase browser client (anon key) used for Realtime subscriptions in chat and video pages.

---

### Custom Hooks (`src/hooks/`)

#### `useActivities.ts`
| Hook | Description |
|------|-------------|
| `useActivities(filters)` | Fetches all activities matching filters |
| `useActivity(id)` | Fetches a single activity |
| `useParticipants(id)` | Fetches participants (staleTime: 0, always re-fetches) |
| `useCreateActivity()` | Mutation — invalidates `activities`, `joinedActivities`, `notifications` |
| `useUpdateActivity(id)` | Mutation — invalidates activity |
| `useDeleteActivity()` | Mutation — invalidates activities list |
| `useJoinActivity(id)` | Mutation — invalidates `activity`, `participants`, `joinedActivities`, `notifications` |
| `useLeaveActivity(id)` | Mutation — invalidates `activity`, `participants`, `joinedActivities` |
| `useSaveActivity(id)` | Mutation — toggles save/unsave based on current saved state |

#### `useUser.ts`
| Hook | Description |
|------|-------------|
| `useUser(id)` | Fetches user profile |
| `useUserActivities(userId)` | Fetches hosted activities |
| `useSavedActivities(userId)` | Fetches saved activities (staleTime: 0) |
| `useJoinedActivities(userId)` | Fetches joined activities (staleTime: 0) |
| `useUpdateUser(id)` | Mutation — invalidates user query |

#### `useNotifications.ts`
| Hook | Description |
|------|-------------|
| `useNotifications()` | Fetches notifications, polling every 30s (only when user is logged in) |
| `useMarkNotificationRead()` | Mutation — marks one notification read, invalidates notifications |
| `useMarkAllNotificationsRead()` | Mutation — marks all read, invalidates notifications |

#### `useCategories.ts`
- `useCategories()` — Fetches all categories (5-minute stale time)

#### `useReviews.ts`
| Hook | Description |
|------|-------------|
| `useReviews(activityId)` | Fetches reviews for an activity |
| `useCreateReview(activityId)` | Mutation — invalidates reviews |
| `useDeleteReview(activityId)` | Mutation — invalidates reviews |

---

### Pages (`src/pages/`)

#### `Login.tsx`
Email input form that calls `sendOtp` and navigates to `/verify`. Includes Google OAuth button. Saves the intended destination URL for post-login redirect.

#### `Verify.tsx`
OTP code input. Calls `verifyOtp`, stores tokens, and calls `AuthContext.login()` to set up the session.

#### `AuthCallback.tsx`
Handles the OAuth redirect from Supabase after Google sign-in. Extracts the session from the URL and logs the user in.

#### `Explore.tsx`
Main discovery page. Renders a responsive grid of `ActivityCard` components filtered by category, difficulty, city, and keyword. Shows join/saved badges per card using `useJoinedActivities` + `useSavedActivities`. Includes skeleton loading and empty states.

#### `ActivityDetail.tsx`
Full activity view showing title, description, date, time, location, difficulty, host card, capacity bar, participant list, reviews section, similar activities carousel, and action buttons (join/leave, save, chat, video call).

#### `CreateActivity.tsx`
4-step form wizard:
- **Step 0:** Title, description, category
- **Step 1:** Date, time, city, location, participant limit, difficulty, tags
- **Step 2:** Safety instructions, public/private toggle
- **Step 3:** Review summary before publishing

Fires confetti animation on success and navigates to `/explore`.

#### `ActivityChat.tsx`
Real-time group chat. Loads message history via API, then opens a **Supabase Realtime** `postgres_changes` subscription to stream new messages. Messages auto-scroll to the bottom. Enter key sends a message.

#### `ActivityVideoCall.tsx`
Peer-to-peer video using **WebRTC**:
1. Host calls `startCall()` → Supabase broadcast event `call-started`
2. Participants poll `getCall()` every 2 seconds until call is active
3. Participant joins → sends `join` signal via Supabase broadcast
4. Host creates offer → exchanges offer/answer/ICE candidates through Supabase broadcast channel
5. `RTCPeerConnection` established → video streams displayed
6. Mic toggle and hang-up controls; ending the call updates DB status to `ended`

ICE server: `stun:stun.l.google.com:19302`

#### `Profile.tsx`
User profile page with avatar, bio, stats (activities hosted, joined, streak). Four tabs: **Upcoming**, **Hosted**, **Saved**, **Past** — each renders `ActivityCard` lists filtered appropriately by date.

#### `Admin.tsx`
Admin dashboard for platform-level activity management.

---

### Components (`src/components/`)

#### `Navbar.tsx`
Sticky top navigation. Contains:
- Search bar (navigates to `/explore?search=query`)
- Notification bell with unread badge count — dropdown shows recent notifications with click-to-navigate
- Create Activity button
- User avatar → profile link
- Logout button
- Mobile hamburger menu

#### `ActivityCard.tsx`
Displays an activity preview: title, date, location, host avatar, difficulty badge, participant count. Handles join/leave and save/unsave actions with toast feedback. Respects `isJoined`, `isSaved`, and `isOwner` props.

#### `ProtectedRoute.tsx`
Wrapper for routes requiring authentication. Shows a loading spinner while auth state loads; redirects to `/login` with the current path saved as redirect-back state if unauthenticated.

#### `EmptyState.tsx`
Reusable empty state with icon, title, description, and optional action button.

#### `SkeletonCard.tsx`
Animated loading skeleton matching the dimensions of `ActivityCard`.

#### `MobileNav.tsx`
Fixed bottom navigation bar shown on small screens (Home, Explore, Create, Profile).

#### `Footer.tsx`
Page footer with branding and links.

---

## Data Flows

### Authentication
```
Login → sendOtp(email) → Supabase OTP email
Verify → verifyOtp(email, token) → Backend upserts users row → returns tokens
AuthContext.login(tokens) → fetchMe() → user state set globally
```

### Join an Activity
```
ActivityCard join button
  → useJoinActivity.mutate(id)
  → POST /activities/:id/join
  → Check capacity → insert participant
  → DB trigger increments current_participants
  → Notify host (type: participant_joined)
  → Invalidate: activity, participants, joinedActivities, notifications
  → UI reflects joined state
```

### Real-time Chat
```
Page mount → fetchMessages() → display history
           → supabase.channel('messages:<id>').on('postgres_changes', INSERT)
User sends → POST /activities/:id/messages → DB insert
           → Realtime fires → all subscribers receive new message
           → Auto-scroll to bottom
```

### Video Call (WebRTC)
```
Host → startCall() → DB call record (status: active)
     → Supabase broadcast: 'call-started'

Participant → polls getCall() every 2s
           → getUserMedia() → RTCPeerConnection
           → broadcast 'join' signal

Host receives 'join' → createOffer() → broadcast 'offer'
Participant → setRemoteDescription(offer) → createAnswer() → broadcast 'answer'
Host → setRemoteDescription(answer)
Both → exchange ICE candidates via broadcast
     → streams flow, video renders
```

### Notification Polling
```
Navbar → useNotifications() polls every 30s
       → shows unread badge count
Click notification → markNotificationRead() → navigate to activity
Mark All → markAllNotificationsRead()
```

---

## Environment Variables

### Backend (`backend/.env`)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
CLIENT_URL=http://localhost:5173        # comma-separated for multiple origins
PORT=3000
```

### Frontend (`linkup-activities/.env`)
```
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Setup & Running

### 1. Clone the repo
```bash
git clone https://github.com/Umer529/Linkup
cd LinkUp
```

### 2. Backend
```bash
cd backend
npm install
# add .env (see above)
npm run dev        # or: node index.js
```

### 3. Frontend
```bash
cd linkup-activities
npm install
# add .env (see above)
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

### 4. Database
Run `backend/database/schema.sql` in the Supabase SQL editor to create all tables, triggers, and indexes.
