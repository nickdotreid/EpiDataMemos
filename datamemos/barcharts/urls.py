from django.conf.urls.defaults import patterns, include, url
from django.views.generic import DetailView, ListView

urlpatterns = patterns('barcharts.views',
	url(r'^(?P<chart_id>\d+)$','load_chart'),
)
