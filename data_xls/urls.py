from django.conf.urls.defaults import patterns, include, url
from django.views.generic import DetailView, ListView
from models import Xls

urlpatterns = patterns('data_xls.views',
	url(r'^$',
		ListView.as_view(
			model=Xls,
			context_object_name="xls_list",
		)),
	url(r'^(?P<xls_id>\d+)/$','detail'),
)
