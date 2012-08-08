# Django settings for website project.


TEMPLATE_CONTEXT_PROCESSORS = (
	'django.core.context_processors.debug',
	'django.core.context_processors.i18n',
	'django.core.context_processors.media',
	'django.core.context_processors.static',
	'django.contrib.auth.context_processors.auth',
	'django.contrib.messages.context_processors.messages',
)

import os

DEBUG = True
TEMPLATE_DEBUG = DEBUG

SITE_ROOT = os.path.join(os.getcwd(), 'datamemos')

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

import dj_database_url
DATABASES = {'default': dj_database_url.config(default='postgres://localhost')}

TIME_ZONE = 'America/Chicago'
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

USE_I18N = True

USE_L10N = True

MEDIA_ROOT = os.path.join(os.getcwd(),'media')
MEDIA_URL = '/media/'

STATIC_ROOT = os.path.join(os.getcwd(),'site-media')
STATIC_URL = '/static/'

ADMIN_MEDIA_PREFIX = '/static/admin/'

STATICFILES_DIRS = (
	SITE_ROOT+'/static',
)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'yaz8-rdhr@j58i9&9e+j)c=+(u5a(=(2d$nt0kz1$v3qm#^h7&'

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (
  os.path.join(SITE_ROOT, 'templates')
)

INSTALLED_APPS = (
	'storages',
	'crispy_forms',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
	'south',
	'adminsortable',
	'notes',
	'charts',
	'barcharts',
	'statistics',
	'homepage',
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

if 'PRODUCTION' in os.environ:
	from settings_production import *
else:
	from settings_development import *