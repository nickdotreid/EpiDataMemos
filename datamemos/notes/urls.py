from django.conf.urls.defaults import patterns, include, url
from django.views.generic import DetailView, ListView
from models import Note

urlpatterns = patterns('notes.views',
	url(r'^$','list'),
	url(r'^create/$','create'),
	url(r'^(?P<note_id>\d+)$','detail'),
	url(r'^(?P<note_id>\d+)/edit/$','edit'),
	url(r'^bookmark/$','save_bookmark'),
	url(r'^bookmark/(?P<bookmark_id>\d+)$','save_bookmark'),
)
