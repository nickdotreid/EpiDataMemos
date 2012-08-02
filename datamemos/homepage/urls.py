from django.conf.urls.defaults import patterns, include, url
from django.views.generic import DetailView, ListView

urlpatterns = patterns('homepage.views',
	url(r'^$','load_chart'),
)
