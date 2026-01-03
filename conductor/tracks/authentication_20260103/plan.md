# Authentication Plan

## Goal
Implement a simple auth challenge to present before a user can access the app.

## Steps

1.  **Environment Configuration**:
    *   [x] Add `AUTH_SECRET` (for the simple password challenge) to `.env.local` (and `.env.example` if exists, or instructions).
    *   [x] Add `SESSION_SECRET` (optional, using simple cookie check for now).

2.  **Middleware Implementation (`middleware.ts`)**:
    *   [x] Create `middleware.ts` at root (or `src/` depending on Next.js config).
    *   [x] Logic: Check for `session` cookie.
    *   [x] Redirect unauthenticated users to `/login`.
    *   [x] Redirect authenticated users on `/login` to `/`.
    *   [x] Exclude public paths.

3.  **Backend API Routes**:
    *   [x] **Login (`src/app/api/auth/login/route.ts`)**: Validate password, set cookie.
    *   [x] **Logout (`src/app/api/auth/logout/route.ts`)**: Delete cookie.

4.  **Frontend Components & Pages**:
    *   [x] **Login Page (`src/app/login/page.tsx`)**: Password input, submit handler.
    *   [x] **Logout Component (`src/components/auth/logout-button.tsx`)**: Button to call logout API.
    *   [x] **Layout Update (`src/components/layout/dashboard-shell.tsx`)**: Add Logout button.

5.  **Testing**:
    *   [x] `login.test.tsx`
    *   [x] Verify protection manually or via integration tests.

6.  **Documentation**:
    *   [x] Update `conductor/tracks.md`