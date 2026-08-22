"""
Local development settings.

Use with: DJANGO_SETTINGS_MODULE=saudi_dashboard.settings.local (the default,
see manage.py / wsgi.py / asgi.py).
"""

import os

from .base import *  # noqa: F401,F403

# SECURITY WARNING: keep the secret key used in production secret!
# This default is only ever used for local development.
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-evn7xp@=9-m6r*(cz*^p98zr*%ffh^%ri6!6vq2$fuscnl$544',
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']
