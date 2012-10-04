from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	url(r'^', include('homepage.urls')),
	url(r'^charts/(?P<chart_id>\d+)','homepage.views.load_chart'),
	url(r'^charts/', include('charts.urls')),
	url(r'^notes/(?P<note_id>\d+)','homepage.views.load_note'),
	url(r'^bookmark/$','notes.views.save_bookmark'),
	url(r'^bookmark/(?P<bookmark_id>\d+)$','homepage.views.load_bookmark'),
	url(r'^bookmark/(?P<bookmark_id>\d+)$','notes.views.save_bookmark'),
	url(r'^notes/', include('notes.urls')),
    url(r'^admin/', include(admin.site.urls)),
)