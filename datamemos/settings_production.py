import os

if 'debug' in os.environ:
	DEBUG = True
	TEMPLATE_DEBUG = DEBUG
else:
	DEBUG = False
	TEMPLATE_DEBUG = DEBUG	

if 'secret_key' in os.environ:
	SECRET_KEY = os.environ['secrect_key']

if 'aws_static_url' in os.environ and 'aws_access_key' in os.environ and 'aws_secret_access_key' in os.environ and 'aws_bucket_name' in os.environ:
	STATIC_ROOT = ''
	STATIC_URL = os.environ['aws_static_url']
	
	STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
	DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
	AWS_ACCESS_KEY_ID = os.environ['aws_access_key']
	AWS_SECRET_ACCESS_KEY = os.environ['aws_secret_access_key']
	AWS_STORAGE_BUCKET_NAME = os.environ['aws_bucket_name']
	
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

if 'SENDGRID_USERNAME' in os.environ and 'SENDGRID_PASSWORD' in os.environ:
	EMAIL_HOST_USER = os.environ['SENDGRID_USERNAME']
	EMAIL_HOST= 'smtp.sendgrid.net'
	EMAIL_PORT = 587
	EMAIL_USE_TLS = True
	EMAIL_HOST_PASSWORD = os.environ['SENDGRID_PASSWORD']