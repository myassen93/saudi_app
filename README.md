# لوحة تحكم السعودية (Saudi Dashboard)

A small user-management dashboard with three parts in this repo: a Django
backend/API, a React web client, and a React Native mobile client. Staff
manage users (username, password, gender); any signed-in user sees
registered-user stats (total, and counts by gender) and can protect their own
account with TOTP two-factor authentication. Arabic (default, RTL) and
English (LTR), themed in Saudi green with IBM Plex Sans (Arabic + Latin).

```
backend/   Django + DRF — the only source of truth; both clients below just consume its REST API
web/       React + TypeScript (Vite) — browser client
mobile/    React Native + TypeScript (Expo) — phone client
```

The web and mobile clients are independent, feature-equivalent frontends for
the same backend — same endpoints, same branding, same login/2FA flow. Each
has its own detailed README; **this file covers the system as a whole and how
to get all three running together.**

## Quick start

You need the backend running first — both clients are useless without it.

```bash
# 1. Backend (Python 3.12+, Poetry)
cd backend
poetry install
poetry run python manage.py migrate
poetry run python manage.py seed_data      # creates demo accounts, see below
poetry run python manage.py runserver 0.0.0.0:8080
```

```bash
# 2a. Web client (Node 20+) — in a separate terminal
cd web
npm install
npm run dev          # → http://localhost:5173, proxies /api to :8080
```

```bash
# 2b. Mobile client (Node 18+, Expo Go on your phone) — in a separate terminal
cd mobile
npm install
npx expo start       # scan the QR code with Expo Go
```

`0.0.0.0` (not `127.0.0.1`) on the backend matters: it's what lets the mobile
app's emulator/device and the web dev proxy all reach it. Port `8080` is a
convention shared by both clients' dev configs — change it in one place
(`backend`'s runserver command) and update the corresponding client config if
you deviate from it.

### Demo accounts

`manage.py seed_data` (idempotent — safe to re-run) creates:

| Role | Username | Password | Sees |
|---|---|---|---|
| Admin | `admin` | `Admin12345` | Dashboard stats, own 2FA settings, **and** the Users management panel |
| Normal user | `user` | `User12345` | Dashboard stats and own 2FA settings only |

Dev-only defaults — never rely on them outside local development.

## Architecture

```
┌─────────────┐        ┌─────────────┐
│  web/       │        │  mobile/    │
│  (Vite/     │        │  (Expo/     │
│   React)    │        │   RN)       │
└──────┬──────┘        └──────┬──────┘
       │   Authorization: Token <key>  │
       └───────────────┬───────────────┘
                        ▼
              ┌───────────────────┐
              │  backend/         │
              │  Django + DRF     │
              │  (accounts,       │
              │   dashboard apps) │
              └───────────────────┘
```

- **Auth**: DRF `TokenAuthentication` — `Authorization: Token <key>`, not
  `Bearer`. `POST /api/auth/login/` returns the token, or `401
  {otp_required: true}` if the account has TOTP 2FA enabled, in which case
  the same endpoint is re-posted with an added `otp_token`.
- **Roles**: just Django's built-in `is_staff` — no custom roles model. The
  login response doesn't include it, so both clients discover it reactively:
  they call `GET /api/users/` and hide the whole user-management panel on a
  `403` rather than checking a role flag up front.
- **2FA**: TOTP only (django-otp), no SMS/backup codes. Any signed-in user
  manages their own device via `/api/auth/2fa/{status,setup,confirm,disable}/`.
- **i18n**: Arabic is the source language and the default/fallback in both
  clients; English is a secondary translation. Both flip layout direction
  (RTL/LTR) based on the selected language.

Full endpoint-by-endpoint reference: see `backend/README.md`.

## Repo layout

```
saudi_app/
├── backend/     Django project — accounts app (users, auth, 2FA), dashboard app (stats)
│                See backend/README.md for the full endpoint table, settings, and seed data.
├── web/         Vite + React 19 + TypeScript, Redux Toolkit + Context, i18next
│                See web/README.md for its component/store breakdown.
└── mobile/      Expo + React Native + TypeScript, Redux Toolkit, expo-router, i18next
                 See mobile/README.md for setup (incl. physical-device networking) and troubleshooting.
```

## Shared conventions across both clients

- **Branding**: Saudi green (`#006C35`) primary, gold (`#f2c94c`) accent, the
  same bar-chart logo (`web/src/assets/logo.svg`, ported to
  `mobile/components/Logo.tsx` as a `react-native-svg` component)
- **Typography**: IBM Plex Sans Arabic (+ IBM Plex Sans for Latin on web)
- **API contract**: both clients hit the exact same endpoints with the exact
  same field names — see `backend/README.md`'s API table, or either client's
  `src/api/types.ts` (web) / `types/api.types.ts` (mobile) for the TypeScript
  shapes
- **2FA UX**: enable via QR code + manual secret + 6-digit confirm; disable
  with a confirmation prompt; login OTP step resubmits the same
  username/password with `otp_token` added

## Known limitations

- No rate limiting / account lockout on login or 2FA confirm
- TOTP only — no SMS or recovery/backup codes
- No pagination on `GET /api/users/` (fine at small user counts)
- The API's `DELETE /api/users/{id}/` has no self-delete guard (the HTML admin
  views do; the REST API doesn't) — an admin could delete their own account
  via the API
- No CORS headers configured on the backend — the web client works around
  this with a same-origin dev proxy (see `web/README.md`); a production
  deployment serving the web client from a different origin would need
  `django-cors-headers` added
