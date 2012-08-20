from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	url(r'^', include('homepage.urls')),
	url(r'^notes/(?P<note_id>\d+)/$', 'homepage.views.load_note'),
	url(r'^barcharts/', include('barcharts.urls')),
	url(r'^charts/(?P<chart_id>\d+)/$','barcharts.views.load_chart'),
	url(r'^charts/', include('charts.urls')),
	url(r'^statistics/', include('statistics.urls')),
	url(r'^notes/$', 'statistics.views.list'),
	url(r'^notes/', include('notes.urls')),
    url(r'^admin/', include(admin.site.urls)),
)