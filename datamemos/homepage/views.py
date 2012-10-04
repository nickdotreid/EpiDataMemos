from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.conf import settings

from django.template import RequestContext

from charts.models import Chart
from notes.models import Note, Bookmark
from notes.models import Category

import json

def show_home(request):
	categories = Category.objects.filter(viewable=True).all()
	charts_query = Chart.objects
	if request.user.is_authenticated() and request.user.is_staff:
		charts_query = Chart.objects.filter(published=True)
	return render_to_response('homepage/chart.html',{
		'charts':charts_query.all(),
		'categories':categories,
		'google_analytics_id':settings.GOOGLE_ANALYTICS_ID
	},context_instance=RequestContext(request))
	
def load_chart(request,chart_id):
	if request.is_ajax():
		from barcharts.views import load_chart
		return load_chart(request,chart_id)
	chart = get_object_or_404(Chart,pk=chart_id)
	return HttpResponseRedirect("/#charts/%i" % (chart.id))

def load_note(request,note_id):
	if request.is_ajax():
		from notes.views import detail
		return detail(request,note_id)
	note = get_object_or_404(Note,pk=note_id)
	if note.bookmark_set.count() > 0:
		bookmark = note.bookmark_set.get()
		tags = []
		for tag in bookmark.tags.all():
			tags.append(tag.short)
		return HttpResponseRedirect("/#charts/%i/%s" % (bookmark.chart.id,"/".join(tags)))
	return HttpResponseRedirect("/#notes/%i" % (note.id))
	
def load_bookmark(request,bookmark_id):
	if request.is_ajax():
		from notes.views import bookmark_save
		return bookmark_save(request,bookmark_id)
	bookmark = get_object_or_404(Bookmark,pk=bookmark_id)
	tags = []
	for tag in bookmark.tags.all():
		tags.append(tag.short)
	return HttpResponseRedirect("/#charts/%i/%s" % (bookmark.chart.id,"/".join(tags)))