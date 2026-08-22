# Saudi Dashboard (React frontend)

A React + TypeScript frontend for the [Django backend](../backend): staff manage users (username, password, gender, role), any signed-in user sees registered-user stats (total, and counts by gender) and can protect their own account with TOTP two-step verification. Arabic/English localized, themed in Saudi green/white with IBM Plex Sans (Arabic + Latin), consuming the Django REST API directly (no separate backend-for-frontend).

## Stack

- **Vite + React 19 + TypeScript**
- **react-i18next** — Arabic (default) / English, persisted in `localStorage`, flips `<html dir/lang>` for RTL/LTR; a separate `otp` namespace holds the two-step-verification copy
- **Redux Toolkit** — API data: dashboard stats, the users list/CRUD, and the current user's 2FA status (`src/store`)
- **React Context** — auth session: token, current user, the two-step login state machine, `login()`/`verifyOtp()`/`logout()` (`src/context/AuthContext.tsx`)
- **axios** — API client that auto-attaches the `Authorization: Token …` header and force-logs-out on a 401
- **@fontsource** (IBM Plex Sans / IBM Plex Sans Arabic) — self-hosted, no external font request at runtime
- **FontAwesome** (`@fortawesome/react-fontawesome` + `free-solid-svg-icons`) — icons throughout the UI

Redux and Context are deliberately split, not overlapping: Context owns *who is signed in (and whether they still need a 2FA code)*, Redux owns *the data fetched from the API*.

## Project structure

```
web/
├── index.html
├── vite.config.ts                     # dev server + /api proxy to the Django backend
├── src/
│   ├── main.tsx                       # mounts <Provider store><AuthProvider><App /></AuthProvider></Provider>
│   ├── App.tsx                        # top bar (logo, language switch, logout) + login screen or dashboard
│   ├── App.css / index.css            # Saudi green theme, IBM Plex Sans font-face imports
│   ├── i18n.ts                        # i18next setup (translation + otp namespaces) + RTL/LTR <html> sync
│   ├── locales/
│   │   ├── en/translation.json, en/otp.json
│   │   └── ar/translation.json, ar/otp.json
│   ├── assets/logo.svg                # copied from ../backend/static/img/logo.svg
│   ├── api/
│   │   ├── client.ts                  # axios instance: token header, 401 -> global logout event
│   │   └── types.ts                   # TS types mirroring the DRF serializers
│   ├── context/
│   │   └── AuthContext.tsx            # login()/verifyOtp()/cancelOtp()/logout(), session in localStorage
│   ├── store/
│   │   ├── store.ts / hooks.ts
│   │   └── slices/
│   │       ├── dashboardSlice.ts      # fetchDashboardStats -> GET /api/dashboard/
│   │       ├── usersSlice.ts          # fetchUsers/createUser/updateUser/deleteUser -> /api/users/
│   │       └── securitySlice.ts       # fetchTwoFactorStatus/setupTwoFactor/confirmTwoFactor/disableTwoFactor
│   └── components/
│       ├── LoginForm.tsx              # split showcase/card login screen; swaps in OtpVerifyForm mid-flow
│       ├── OtpVerifyForm.tsx          # 6-digit code step, shown when AuthContext.otpRequired is true
│       ├── PageLoader.tsx             # full-screen spinner overlay during auth/data loading
│       ├── Modal.tsx                  # generic portal modal, reused for every popup below
│       ├── UsersPanel.tsx             # admin-only CRUD table; add/edit open as modals; hidden for non-staff (403)
│       ├── UserRow.tsx                # one users-table row + its edit/delete modals
│       └── TwoFactorSettings.tsx      # any signed-in user enables/disables their own TOTP 2FA
└── public/logo.svg                    # favicon
```

## APIs used (from `saudi-app`)

| Method | Endpoint | Auth | Used by |
|---|---|---|---|
| POST | `/api/auth/login/` | none | `AuthContext.login()` — `{username, password}` → `{token, username, gender}`, or, if the account has 2FA enabled, `401 {otp_required: true}` |
| POST | `/api/auth/login/` (resubmit) | none | `AuthContext.verifyOtp()` — same endpoint, `{username, password, otp_token}` → `{token, username, gender}` |
| POST | `/api/auth/logout/` | token | `AuthContext.logout()` — invalidates the token server-side |
| GET | `/api/dashboard/` | any signed-in user | `dashboardSlice.fetchDashboardStats` — `{ total_users, gender_counts }` |
| GET/POST | `/api/users/` | staff (`is_staff`) only | `usersSlice.fetchUsers` / `createUser` |
| PATCH/DELETE | `/api/users/{id}/` | staff only | `usersSlice.updateUser` / `deleteUser` |
| GET | `/api/auth/2fa/status/` | any signed-in user | `securitySlice.fetchTwoFactorStatus` — `{ enabled }` |
| POST | `/api/auth/2fa/setup/` | any signed-in user | `securitySlice.setupTwoFactor` — `{ qr_code, secret }` for a new pending device |
| POST | `/api/auth/2fa/confirm/` | any signed-in user | `securitySlice.confirmTwoFactor` — `{otp_token}` → `{ enabled: true }`, confirms the pending device |
| POST | `/api/auth/2fa/disable/` | any signed-in user | `securitySlice.disableTwoFactor` — removes the user's device(s) |

The backend enforces the staff-only restriction itself (`IsAdminUser` on `UserViewSet`); the frontend doesn't know a user's role ahead of time (`/api/auth/login/` doesn't return `is_staff`), so `UsersPanel` optimistically calls `GET /api/users/`, and on a `403` hides the whole users section — a non-staff user only ever sees the dashboard counters (and their own Two-step verification card).

## Two-step verification (TOTP)

Any signed-in user can protect their own login with an authenticator app (Google Authenticator, Authy, etc.) via the **Two-step verification** card on the dashboard (`TwoFactorSettings.tsx`):

1. **Enable** — `POST /auth/2fa/setup/` creates a pending device and returns a QR code (scan it) plus the raw secret (for manual entry). Enter the 6-digit code the app shows to confirm (`POST /auth/2fa/confirm/`), which turns 2FA on.
2. **Sign in afterwards** — `AuthContext.login()` still posts `{username, password}` first; if the account has 2FA enabled, the API responds `401 {otp_required: true}` instead of a token. The credentials are held in memory (never persisted) and `LoginForm` swaps in `OtpVerifyForm`, which resubmits the same request with `otp_token` added (`AuthContext.verifyOtp()`). A wrong code keeps the user on that screen; "Use a different account" backs out to the credentials form.
3. **Disable** — a confirmation modal, then `POST /auth/2fa/disable/`, after which sign-in is single-step again.

No password re-entry is required to disable 2FA (matching the Django dashboard's own session-based 2FA, which this feature is independent of — see `../backend/accounts` for the server-rendered equivalent).

## Setup

Requires Node 20+ and a running backend (see `../backend/README.md`).

```bash
# 1. Install dependencies
npm install

# 2. In a separate terminal, run the Django backend on :8080
#    (Django's own default is :8000 — this app's dev proxy expects :8080, see below)
cd ../backend
poetry run python manage.py runserver 8080

# 3. Run the dev server
npm run dev
```

Then visit `http://localhost:5173/`.

Sign in with any user from the Django app (e.g. `poetry run python manage.py seed_data` in `../backend` creates `admin`/`Admin12345` and `user`/`User12345`). Staff users see the users table with add/edit/delete; everyone else sees the dashboard counters and can enable their own two-step verification.

## Dev proxy / CORS

The backend doesn't have `django-cors-headers` configured, so in dev, Vite proxies `/api/*` to the Django backend (`vite.config.ts`), keeping every request same-origin from the browser's point of view. The proxy target defaults to `http://localhost:8080` and can be overridden with `VITE_API_PROXY_TARGET`. For a production deployment where the frontend isn't served from the same origin/reverse-proxy as Django, you'll need to either add CORS headers on the backend or serve both behind the same origin.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint
