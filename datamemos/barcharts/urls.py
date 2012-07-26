from django.conf.urls.defaults import patterns, include, url
from django.views.generic import DetailView, ListView

urlpatterns = patterns('charts.views',
	url(r'^(?P<xls_id>\d+)/$','load_chart'),
)
