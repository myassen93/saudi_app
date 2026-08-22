"""
Production settings.

Use with: DJANGO_SETTINGS_MODULE=saudi_dashboard.settings.production, set
explicitly in the deployment environment (e.g. the gunicorn/uwsgi service,
or wsgi.py's env if that's how this is deployed).

Required environment variables:
    DJANGO_SECRET_KEY        - secret key, no default (fails fast if unset)
    DJANGO_ALLOWED_HOSTS     - comma-separated list of allowed hostnames

Optional environment variables (database, defaults to sqlite):
    DJANGO_DB_ENGINE, DJANGO_DB_NAME, DJANGO_DB_USER, DJANGO_DB_PASSWORD,
    DJANGO_DB_HOST, DJANGO_DB_PORT

Optional environment variables (CORS, defaults to no cross-origin access):
    DJANGO_CORS_ALLOWED_ORIGINS - comma-separated list of origins allowed to
        call this API from a browser, e.g. https://saudiapp.netlify.app
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
    for host in os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',')
    if host.strip()
]

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get('DJANGO_CORS_ALLOWED_ORIGINS', '').split(',')
    if origin.strip()
]

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
