from django.conf.urls.defaults import patterns, include, url
from django.views.generic import DetailView, ListView
from models import Note

urlpatterns = patterns('notes.views',
	url(r'^$',
		ListView.as_view(
			queryset = Note.objects.order_by('-pub_date')[:5],
			context_object_name = 'recent_notes',
			template_name = 'notes/index.html')),
	url(r'^create/$','create'),
	url(r'^(?P<note_id>\d+)/$','detail'),
	url(r'^(?P<note_id>\d+)/edit/$','edit'),
)
