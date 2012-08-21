from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect

from django.template import RequestContext

from charts.models import Chart
from notes.models import Note
from notes.models import Category

import json

def show_home(request):
	return render_to_response('homepage/homepage.html',context_instance=RequestContext(request))

def load_chart(request):
	return render_to_response('homepage/chart.html',{
		'charts':Chart.objects.all(),
		'categories':Category.objects.filter(viewable=True).all(),
	},context_instance=RequestContext(request))

def load_note(request,note_id):
	note = get_object_or_404(Note,pk=note_id)
	for statistic in note.statistic_set.all():
		if statistic.chart:
			tags = []
			for tag in statistic.tags.all():
				tags.append(tag.short)
			return HttpResponseRedirect("/#/?chart=%i&note=%i&tags=%s" % (statistic.chart.id,note.id,",".join(tags)))
	return HttpResponseRedirect("/#/?note=%i" % (note.id))
	