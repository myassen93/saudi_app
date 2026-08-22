"""
Production settings.

Use with: DJANGO_SETTINGS_MODULE=saudi_dashboard.settings.production, set
explicitly in the deployment environment (e.g. the gunicorn/uwsgi service,
or wsgi.py's env if that's how this is deployed).

Deployed at https://saudidashboard.pythonanywhere.com by default (see
DJANGO_ALLOWED_HOSTS / DJANGO_CSRF_TRUSTED_ORIGINS below to point elsewhere).

Required environment variables:
    DJANGO_SECRET_KEY        - secret key, no default (fails fast if unset)

Optional environment variables:
    DJANGO_ALLOWED_HOSTS         - comma-separated hostnames
                                   (default: saudidashboard.pythonanywhere.com)
    DJANGO_CSRF_TRUSTED_ORIGINS  - comma-separated scheme+host origins for the
                                   Django-rendered pages (dashboard/admin)
                                   (default: https://saudidashboard.pythonanywhere.com)
    DJANGO_CORS_ALLOWED_ORIGINS  - comma-separated origins allowed to call the
                                   REST API from a browser (the React web app).
                                   Not needed for the mobile app — CORS is a
                                   browser-only mechanism; native/mobile
                                   clients just call the API with the token
                                   from /api/auth/login/ in an Authorization
                                   header, same as any other API client.
                                   Empty by default: set this once the
                                   deployed frontend's URL is known.

Optional environment variables (database, defaults to sqlite):
    DJANGO_DB_ENGINE, DJANGO_DB_NAME, DJANGO_DB_USER, DJANGO_DB_PASSWORD,
    DJANGO_DB_HOST, DJANGO_DB_PORT
"""

import os

from .base import *  # noqa: F401,F403
from .base import BASE_DIR

# SECURITY WARNING: keep the secret key used in production secret!
# No default here on purpose: fail fast at startup if it isn't configured.
SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

DEBUG = False

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        'DJANGO_ALLOWED_HOSTS', 'saudidashboard.pythonanywhere.com'
    ).split(',')
    if host.strip()
]

# Needed because PythonAnywhere terminates HTTPS at its own reverse proxy —
# Django's CSRF Origin check needs an explicit scheme+host match for the
# dashboard/admin login forms to work.
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        'DJANGO_CSRF_TRUSTED_ORIGINS', 'https://saudidashboard.pythonanywhere.com'
    ).split(',')
    if origin.strip()
]

# The React web app's deployed origin(s). Left empty until it's known — set
# DJANGO_CORS_ALLOWED_ORIGINS before the frontend needs to call this API.
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get('DJANGO_CORS_ALLOWED_ORIGINS', '').split(',')
    if origin.strip()
]

# Where `collectstatic` gathers files for the host's web server (or, on
# PythonAnywhere, its static-files URL mapping in the Web tab) to serve —
# Django itself doesn't serve static files when DEBUG=False.
STATIC_ROOT = BASE_DIR / 'staticfiles'

DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DJANGO_DB_ENGINE', 'django.db.backends.sqlite3'),
        'NAME': os.environ.get('DJANGO_DB_NAME', str(BASE_DIR / 'db.sqlite3')),
        'USER': os.environ.get('DJANGO_DB_USER', ''),
        'PASSWORD': os.environ.get('DJANGO_DB_PASSWORD', ''),
        'HOST': os.environ.get('DJANGO_DB_HOST', ''),
        'PORT': os.environ.get('DJANGO_DB_PORT', ''),
    }
}

MAILERS = {
    'default': {
        'BACKEND': 'django.core.mail.backends.smtp.EmailBackend',
        'OPTIONS': {
            'host': os.environ.get('DJANGO_EMAIL_HOST', 'localhost'),
            'port': int(os.environ.get('DJANGO_EMAIL_PORT', '587')),
            'username': os.environ.get('DJANGO_EMAIL_HOST_USER', ''),
            'password': os.environ.get('DJANGO_EMAIL_HOST_PASSWORD', ''),
            'use_tls': os.environ.get('DJANGO_EMAIL_USE_TLS', 'true').lower() == 'true',
        },
    },
}

# Hardened security settings for serving over HTTPS.
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'
