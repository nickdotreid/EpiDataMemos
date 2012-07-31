from django.conf.urls.defaults import patterns, include, url
from django.views.generic import DetailView, ListView
from models import Statistic

urlpatterns = patterns('statistics.views',
	url(r'^$','list'),
	url(r'^(?P<statistic_id>\d+)/$','detail'),
)
