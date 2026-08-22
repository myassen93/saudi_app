# لوحة تحكم السعودية (Saudi Dashboard)

A small Django control panel: staff create/manage users (username, password,
gender), users log in to see a dashboard of registered-user stats (total, and
counts by gender). Exposed both as server-rendered pages and as a REST API,
themed in Saudi green/white with IBM Plex Sans (Arabic + Latin).

## Stack

- **Django 6.1**, custom `User` model (`accounts.User`) with a `gender` field
- **django-admin-interface** — themed `/admin/` (Saudi green, IBM Plex Sans)
- **django-crispy-forms** — with a hand-written `saudi_theme` template pack
  (no Bootstrap dependency) so HTML forms match the rest of the UI
- **djangorestframework** + **drf-spectacular** — REST API with Swagger/ReDoc
  docs
- **django-otp** — opt-in TOTP 2FA: users confirm a device under "الأمان" on
  the dashboard, after which sign-in requires an authenticator code (see
  `accounts.mixins.TwoFactorRequiredMixin`)
- **django-rosetta** — in-browser `.po` translation editor at `/rosetta/`
- **Arabic/English switcher** — navbar toggle backed by Django's built-in
  `django.views.i18n.set_language` (`/i18n/setlang/`); flips `dir`/`lang`,
  mirrors the layout (the CSS uses logical properties throughout), and
  translates all page copy — every template string is wrapped in
  `{% trans %}`/`{% blocktranslate %}`, form/model/message strings use
  `gettext_lazy`, and `locale/en/LC_MESSAGES/django.po` has the English
  translations compiled (`manage.py compilemessages`). Re-run
  `makemessages -l en` after adding new user-facing strings, translate the
  new entries (by hand or via `/rosetta/`), then `compilemessages` again
- **Poetry** for dependency management

## Project structure

```
backend/
├── manage.py
├── pyproject.toml / poetry.lock       # Poetry deps + lockfile
├── db.sqlite3                         # dev database (sqlite)
│
├── saudi_dashboard/                   # project package
│   ├── settings/
│   │   ├── base.py                    # shared settings (apps, middleware, i18n, ...)
│   │   ├── local.py                   # dev defaults (DEBUG=True), used by manage.py by default
│   │   └── production.py              # DEBUG=False, reads secrets/hosts/db from env, fails fast if unset
│   ├── urls.py                        # root URLconf: admin, api, api docs, users, dashboard
│   ├── wsgi.py / asgi.py
│
├── accounts/                          # user model + user management (staff-only CRUD)
│   ├── models.py                      # User(AbstractUser) + gender field
│   ├── admin.py                       # User registered in Django admin
│   ├── forms.py                       # UserCreateForm / UserUpdateForm (HTML, crispy)
│   ├── views.py                       # UserCreateView/UpdateView/DeleteView (staff-only)
│   ├── urls.py                        # /users/add/, /users/<pk>/edit/, /users/<pk>/delete/
│   ├── serializers.py                 # UserSerializer (REST), LoginResponseSerializer
│   ├── api_views.py / api_urls.py     # UserViewSet (CRUD), login/logout (token auth)
│   └── management/commands/
│       └── seed_data.py               # `manage.py seed_data` — demo admin + normal user
│
├── dashboard/                         # login/logout pages + dashboard stats
│   ├── forms.py                       # LoginForm (crispy)
│   ├── views.py                       # DashboardView (login-required HTML page)
│   ├── services.py                    # get_dashboard_stats() — shared by the HTML page and the API
│   ├── urls.py                        # /login/, /logout/, / (dashboard)
│   └── api_views.py / api_urls.py     # /api/dashboard/ (GET, authenticated)
│
├── templates/
│   ├── dashboard/                     # base.html (layout/theme), login.html, dashboard.html
│   ├── accounts/                      # user_form.html, user_confirm_delete.html,
│   │                                  # otp_setup.html, otp_verify.html
│   ├── admin/base_site.html           # font override for the Django admin
│   └── saudi_theme/                   # custom crispy-forms template pack
│
├── static/img/logo.svg
└── locale/en/LC_MESSAGES/             # django.po/.mo — English translations
                                        # (source strings are Arabic)
```

## Setup

Requires Python 3.12+ and [Poetry](https://python-poetry.org/).

```bash
# 1. Install dependencies (creates .venv inside the project — see poetry.toml)
poetry install

# 2. Apply migrations (also seeds the Saudi green admin theme)
poetry run python manage.py migrate

# 3. Create an admin/staff user (can create other users, sees the CRUD table)
poetry run python manage.py createsuperuser

# 3b. ...or seed demo accounts instead (idempotent, safe to re-run)
poetry run python manage.py seed_data

# 4. Run the dev server
poetry run python manage.py runserver
```

Then visit:

| URL | What |
|---|---|
| `/` | Dashboard (login required) |
| `/login/`, `/logout/` | Auth pages |
| `/admin/` | Django admin (themed) |
| `/rosetta/` | Translation editor (staff only) |
| `/api/docs/` | Swagger UI |
| `/api/redoc/` | ReDoc |
| `/api/schema/` | Raw OpenAPI schema |

By default `manage.py`/`wsgi.py`/`asgi.py` use
`DJANGO_SETTINGS_MODULE=saudi_dashboard.settings.local` (permissive, `DEBUG=True`,
no env vars required). No `.env` file is read automatically — export env vars
in your shell, or prefix commands, e.g. `DJANGO_SECRET_KEY=... poetry run ...`.

## Seed data

`manage.py seed_data` creates one admin (staff) user and one normal user for
local development — handy instead of `createsuperuser` when you just want to
click around. It's idempotent: existing usernames are left untouched and
reported as skipped, so it's safe to run again (e.g. after `migrate` on a
fresh dev database).

```bash
poetry run python manage.py seed_data
```

| Role | Username | Password | Flags |
|---|---|---|---|
| Admin | `admin` | `Admin12345` | `is_staff=True`, `is_superuser=True` |
| Normal user | `user` | `User12345` | `is_staff=False` |

Override any of the four with flags, e.g. for a second environment or to
avoid the default (dev-only) credentials:

```bash
poetry run python manage.py seed_data \
  --admin-username admin --admin-password 'S0meStrongerPass!' \
  --user-username user --user-password 'AnotherPass!'
```

These defaults are for local development only — never rely on them in a
shared or production environment.

## REST API

Token-authenticated (`Authorization: Token <key>`), documented in full at
`/api/docs/`:

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/api/auth/login/` | POST | — | `username`/`password` → token |
| `/api/auth/logout/` | POST | any token | invalidates the caller's token |
| `/api/users/` | GET/POST | staff token | list / create users |
| `/api/users/<id>/` | GET/PUT/PATCH/DELETE | staff token | manage one user |
| `/api/dashboard/` | GET | any token | total users + counts by gender |

## Production settings

Deploy with `DJANGO_SETTINGS_MODULE=saudi_dashboard.settings.production` and
set (at minimum):

```
DJANGO_SECRET_KEY=...           # required, no default
DJANGO_ALLOWED_HOSTS=example.com
```

Optional env vars for the database (`DJANGO_DB_ENGINE`, `DJANGO_DB_NAME`,
`DJANGO_DB_USER`, `DJANGO_DB_PASSWORD`, `DJANGO_DB_HOST`, `DJANGO_DB_PORT`)
and outgoing email (`DJANGO_EMAIL_HOST`, `DJANGO_EMAIL_PORT`,
`DJANGO_EMAIL_HOST_USER`, `DJANGO_EMAIL_HOST_PASSWORD`,
`DJANGO_EMAIL_USE_TLS`) — both default to sqlite / localhost if unset.
Production also enables HTTPS/HSTS/secure-cookie settings.

## Notes

- **django-otp** device enrollment/verification is wired into the dashboard
  and staff CRUD pages (`accounts.mixins.TwoFactorRequiredMixin`), but
  `/admin/` itself still uses the plain `AdminSite` — a staff user could
  still reach `/admin/` on password alone. Swap in
  `django_otp.admin.OTPAdminSite` if `/admin/` needs the same OTP gate.
- Only staff (`is_staff`) can create/edit/delete users, both on the dashboard
  page and via the API — there is no public self-signup, matching the
  original spec (admin creates accounts).
- REST API strings (drf-spectacular summaries/tags, `SPECTACULAR_SETTINGS`
  title/description) are still hardcoded Arabic — only the human-facing
  HTML pages and their backing Python strings were marked up for
  translation.
