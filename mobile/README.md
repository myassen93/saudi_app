# لوحة تحكم السعودية — Mobile (React Native / Expo)

A React Native + TypeScript mobile client for the **saudi-app** Django
dashboard: staff manage users (username, password, gender), any signed-in
user sees registered-user stats (total, and counts by gender) and can protect
their own account with TOTP two-factor authentication. Arabic (default, RTL)
and English (LTR), themed in Saudi green with the same logo and IBM Plex Sans
Arabic typography as the web dashboard, consuming the Django REST API
directly — no separate backend-for-frontend.

This app is a mobile counterpart to **`saudi_app_react`** (the Vite/React web
client for the same backend) — same features, same API, same branding,
rebuilt for React Native. It also follows the architectural conventions
established in this developer's other Expo apps (see `trophyApp`): Redux
Toolkit slices, `expo-router` file-based navigation, AsyncStorage, and the
`I18nManager.forceRTL` + restart pattern for RTL switching.

## Features

- Username/password login (`POST /api/auth/login/`)
- TOTP two-factor login step when the account has 2FA enabled — the API
  responds `401 {otp_required: true}` instead of a token, and the app shows a
  6-digit code screen that resubmits the same credentials + code
- Two-factor settings: enable (scan a QR code or enter the secret manually,
  confirm with a 6-digit code), disable (with confirmation) — any signed-in
  user manages their own device
- Dashboard stats: total users, male/female breakdown
- Staff-only user management: list, create, inline edit, delete. The panel
  has no a-priori knowledge of the signed-in user's role (the login response
  doesn't include `is_staff`) — it optimistically calls `GET /api/users/` and
  hides itself entirely on a `403`, exactly like the web app
- Arabic (default) / English language switch, persisted across launches, with
  full RTL mirroring
- IBM Plex Sans Arabic typography, Saudi-green branding, and the exact logo
  from `saudi_app_react` (rebuilt as a crisp `react-native-svg` component)

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Expo (managed), React Native, TypeScript |
| Navigation | `expo-router` (file-based, under `app/`) |
| State — fetched API data | Redux Toolkit (`store/slices/{dashboard,security,users}Slice.ts`) |
| State — auth/session | Redux Toolkit (`store/slices/authSlice.ts`), persisted via AsyncStorage |
| State — language/RTL | Redux (`appSlice`) + `context/AppContext.tsx` |
| HTTP | axios (`services/api.ts`), DRF `Authorization: Token <key>` header |
| i18n | i18next / react-i18next, flat `locales/{ar,en}.json` |
| Fonts | IBM Plex Sans Arabic (covers Arabic + Latin), loaded via `expo-font` |
| Icons | `@expo/vector-icons` (FontAwesome5) |
| Logo | `react-native-svg`, ported shape-for-shape from `saudi_app_react`'s SVG |

## Project structure

```
saudi_mobile_app/
├── app/                         expo-router screens
│   ├── _layout.tsx              root layout: fonts, i18n/RTL init, Redux+Context providers
│   ├── index.tsx                redirect gate — /login or /home based on auth state
│   ├── login.tsx                username/password screen
│   ├── otp.tsx                  6-digit TOTP verification step
│   └── home.tsx                 dashboard: Topbar + StatsGrid + 2FA panel + Users panel
├── components/
│   ├── Logo.tsx                 react-native-svg port of saudi_app_react's logo.svg
│   ├── Topbar.tsx                logo/title, welcome text, language switch, logout
│   ├── StatsGrid.tsx             total/male/female stat cards
│   ├── TwoFactorSettingsPanel.tsx status, enable (QR+secret+confirm), disable
│   ├── UsersPanel.tsx            create form + list (staff-only, hides itself on 403)
│   ├── UserRow.tsx               one user row + inline edit + delete confirm
│   ├── AppModal.tsx              shared confirm/alert modal
│   ├── PageLoader.tsx            full-screen loading overlay (pulsing logo)
│   └── RTLTextInput.tsx          TextInput that aligns to the current language
├── store/
│   ├── index.ts / hooks.ts       store setup + typed useAppDispatch/useAppSelector
│   └── slices/
│       ├── appSlice.ts           language + isRTL
│       ├── authSlice.ts          login/logout/restoreAuth, OTP flow, pendingCredentials
│       ├── dashboardSlice.ts     fetchDashboardStats
│       ├── securitySlice.ts      fetchTwoFactorStatus/setupTwoFactor/confirmTwoFactor/disableTwoFactor
│       └── usersSlice.ts         fetchUsers/createUser/updateUser/deleteUser + forbidden flag
├── services/
│   ├── api.ts                    axios instance: token header, Accept-Language, 401 → forced logout
│   └── saudiApi.ts               typed endpoint calls (authApi, securityApi, dashboardApi, usersApi)
├── config/
│   ├── api.config.ts             BASE_URL resolution (per platform) + endpoint paths
│   └── i18n.ts                   i18next init
├── context/
│   └── AppContext.tsx            language + isRTL + changeLanguage() (forceRTL + restart)
├── theme/
│   ├── colors.ts                 Saudi green palette (ported from saudi_app_react's CSS vars)
│   ├── spacing.ts                spacing/radius/font-size/font-family constants
│   └── index.ts
├── locales/
│   ├── ar.json                   Arabic strings (default)
│   └── en.json                   English strings
├── types/
│   └── api.types.ts              request/response types, ported field-for-field from saudi_app_react
├── utils/
│   ├── apiHelpers.ts              DRF error-response parsing → friendly message
│   └── rtl.ts                     useRTL() hook (textAlign, rowDir, flexStart/End, ...)
├── assets/
│   ├── fonts/                    IBM Plex Sans Arabic .ttf (4 weights)
│   └── icon.png, adaptive-icon.png, splash-icon.png, favicon.png  (generated, see below)
└── scripts/
    └── generate-icons.js         regenerates the PNGs above from the logo SVG
```

## Prerequisites

- Node.js 18+ and npm
- The **saudi-app** Django backend, runnable locally (Python 3.12+, [Poetry](https://python-poetry.org/))
- Expo Go app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) — easiest way to run this — or an Android/iOS emulator with the SDKs installed

## Setup

### 1. Run the backend

```bash
cd /opt/WORK/saudi-app        # WSL
poetry install                # first time only
poetry run python manage.py migrate
poetry run python manage.py seed_data     # creates demo accounts, see below
poetry run python manage.py runserver 0.0.0.0:8080
```

`0.0.0.0` (not `127.0.0.1` / the bare default) is required so your phone (on
the same Wi-Fi) and the Android emulator's `10.0.2.2` alias can reach it.
`saudi_dashboard/settings/local.py` already sets `ALLOWED_HOSTS=['*']`, so no
further backend config is needed. Port `8080` matches the convention already
used by `saudi_app_react`'s dev proxy — keep it, or update
`config/api.config.ts` / `EXPO_PUBLIC_API_BASE_URL` if you run it elsewhere.

`seed_data` is idempotent (safe to re-run) and creates:

| Role | Username | Password | Flags |
|---|---|---|---|
| Admin | `admin` | `Admin12345` | `is_staff=True`, sees + manages the Users panel |
| Normal user | `user` | `User12345` | `is_staff=False`, dashboard + own 2FA only |

These are dev-only defaults — never rely on them outside local development.

### 2. Run the mobile app

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android: Expo Go app itself; iOS: the Camera
app), or press `a` / `i` in the terminal for an emulator. `config/api.config.ts`
already picks a sane default per platform:

| Platform | Default API base URL |
|---|---|
| Android emulator | `http://10.0.2.2:8080/api` |
| iOS simulator | `http://localhost:8080/api` |
| Web (`expo start --web`) | `http://localhost:8080/api` |

**Physical device** (the normal way to use Expo Go): neither of the above is
reachable — your phone needs your dev machine's actual LAN IP. Copy
`.env.example` to `.env` and set it there:

```bash
cp .env.example .env
```
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.23:8080/api
```

(Find your LAN IP with `ipconfig` on Windows or `ifconfig`/`ip a` in WSL —
use the Windows host's IP, since that's where the Django server is actually
listening.) Restart `npx expo start` after editing `.env`.

## API reference (backend: `saudi-app`)

Token-authenticated (`Authorization: Token <key>`, **not** `Bearer`), no
version prefix:

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/login/` | — | `{username, password}` → `{token, username, gender}`, or `401 {otp_required: true}` |
| POST | `/api/auth/login/` (resubmit) | — | `{username, password, otp_token}` → same success shape |
| POST | `/api/auth/logout/` | token | invalidates the caller's token server-side |
| GET | `/api/dashboard/` | any signed-in user | `{ total_users, gender_counts: [{gender,label,count}] }` |
| GET | `/api/auth/2fa/status/` | any signed-in user | `{ enabled }` |
| POST | `/api/auth/2fa/setup/` | any signed-in user | `{ qr_code, secret }` for a new pending device |
| POST | `/api/auth/2fa/confirm/` | any signed-in user | `{otp_token}` → `{ enabled: true }` |
| POST | `/api/auth/2fa/disable/` | any signed-in user | removes the user's device(s) → `{ enabled: false }` |
| GET/POST | `/api/users/` | staff (`is_staff`) only | list / create users |
| PATCH/DELETE | `/api/users/{id}/` | staff only | update (password optional) / delete |

Full interactive docs (Swagger/ReDoc) are served by the backend itself at
`/api/docs/` and `/api/redoc/`.

## Scripts

| Command | Does |
|---|---|
| `npm start` | Start the Expo dev server (same as `npx expo start`) |
| `npm run android` / `npm run ios` / `npm run web` | Start and open on that platform |
| `npm run typecheck` | `tsc --noEmit` — type-check the whole project |

## Troubleshooting

**`AsyncStorageError: Native module is null, cannot access legacy storage`**
— `@react-native-async-storage/async-storage` was installed at a version
newer than the one Expo Go for this SDK bundles. Run `npx expo install --check`
to see any mismatched packages, then `npx expo install --fix` (may need
`--legacy-peer-deps` on the underlying `npm install` if it fails on
`expo-router`'s web/`react-dom` peer deps — see below), and restart
`npx expo start`.

**`npm install` fails with `ERESOLVE` / peer-dependency conflicts** — caused
by `expo-router`'s optional web dependencies (`react-dom`, `@radix-ui/*`),
unrelated to this app's own code. Use `npm install --legacy-peer-deps`.

**Login works but the app doesn't reach the backend at all
(`Network error`)** — you're likely on a physical device hitting the
`10.0.2.2`/`localhost` default meant for emulators. Set
`EXPO_PUBLIC_API_BASE_URL` to your machine's LAN IP (see above), and confirm
the backend is bound to `0.0.0.0`, not `127.0.0.1`.

**Language switch doesn't visually mirror to RTL/LTR immediately** —
expected: native RTL layout direction (`I18nManager`) only takes effect after
a true app restart, which `context/AppContext.tsx` triggers automatically via
`react-native-restart`. In Expo Go this sometimes needs a manual reload
(shake the device → "Reload") if the automatic restart doesn't fully apply.

**2FA QR code doesn't scan** — the backend returns it as a
`data:image/png;base64,...` URI which is rendered directly as an `<Image>`;
if it looks broken, check the backend response in `/api/auth/2fa/setup/`
directly (e.g. via `/api/docs/`) before assuming a client bug.

## Regenerating the app icon / splash

`scripts/generate-icons.js` rasterizes the logo SVG into the PNGs under
`assets/`. It needs `sharp`, which is intentionally **not** a project
dependency (it's a large native binary only needed for this one-off) —
install it temporarily:

```bash
npm install --no-save sharp
node scripts/generate-icons.js
npm uninstall sharp --no-save
```

## Known limitations (matching the backend's own current scope)

- No rate limiting / account lockout on login or 2FA confirm (none in the
  Django backend either)
- TOTP only — no SMS or backup/recovery codes (not implemented server-side)
- No pagination on `GET /api/users/` (fine for small user counts; the
  backend doesn't paginate it)
- A staff user can delete their own account via the API (the self-delete
  guard only exists in the backend's HTML views, not the REST API)
