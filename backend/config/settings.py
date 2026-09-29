from pathlib import Path
import os

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / '.env')

# Security settings read from environment variables (.env), with safe
# defaults for local development so nothing breaks if they're unset.
# For real deployment, set SECRET_KEY, DEBUG=False, ALLOWED_HOSTS and
# CORS_ALLOWED_ORIGINS as actual environment variables on the host —
# never hardcode production secrets in this file.
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-mjprints-dev-key-change-before-deploying')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [h.strip() for h in os.getenv('ALLOWED_HOSTS', '*').split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',

    'accounts',
    'branches',
    'products',
    'orders',
    'payroll',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1",
]


ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'



DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Manila'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- Django REST Framework ---------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# CORS — wide open by default (fine for local development). To restrict
# in a real deployment, set CORS_ALLOWED_ORIGINS in the environment as a
# comma-separated list (e.g. "https://mjprints.com") and this will switch
# to allowing only those origins automatically.
_cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
if _cors_origins:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in _cors_origins.split(',') if origin.strip()]
else:
    CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_ALL_ORIGINS = True


# MongoDB application-data connection. Keep the URI in the environment; never
# commit credentials to this file or to a .env file tracked by git.
MONGO_URI = os.getenv('MONGO_URI', '')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'salestrackingsystem')
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')
