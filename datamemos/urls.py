from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	url(r'^charts/', include('charts.urls')),
	url(r'^xls/', include('data_xls.urls')),
	url(r'^notes/', include('notes.urls')),
    url(r'^admin/', include(admin.site.urls)),
	url(r'^$', include('homepage.urls')),
)