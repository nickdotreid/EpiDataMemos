from django.conf.urls.defaults import patterns, include, url
from django.views.generic import DetailView, ListView
from models import Chart

urlpatterns = patterns('charts.views',
	url(r'^$','list'),
	url(r'^(?P<chart_id>\d+)/$','detail'),
)
