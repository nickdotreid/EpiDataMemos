from django.conf.urls.defaults import patterns, include, url
from django.views.generic import DetailView, ListView
from models import Chart

urlpatterns = patterns('charts.views',
	url(r'^$',
		ListView.as_view(
			model=Chart,
			context_object_name="xls_list",
		)),
	url(r'^(?P<chart_id>\d+)/$','detail'),
)
