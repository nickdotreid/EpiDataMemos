from models import Statistic
from notes.models import Note
from charts.models import Chart, Tag
from django.http import HttpResponse, HttpResponseBadRequest, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404
from annoying.functions import get_object_or_None
from django.core.urlresolvers import reverse

from django.template import RequestContext
from django.core.exceptions import ObjectDoesNotExist

import json

def list(request):
	objects = Statistic.objects
	# look for order param
	# look for limit param
	# look for filter param
	if 'chart_id' in request.GET:
		chart = get_object_or_None(Chart,id=int(request.GET['chart_id']))
		if chart is not None:
			objects.filter(chart=chart)
	statistics = objects.all()
	notes = []
	for stat in statistics:
		if stat.note and stat.note.public and stat.note not in notes:
			notes.append(stat.note)
	if request.is_ajax():
		_notes = []
		for note in notes:
			stats = []
			for stat in note.statistic_set.all():
				tags = []
				for tag in stat.tags.all():
					tags.append(tag.short)
				stats.append({
					'id':stat.id,
					'chart_id':stat.chart.id,
					'tags':tags,
				})
			_notes.append({
				'id':note.id,
				'text':note.text,
				'statistics':stats,
			})
		return HttpResponse(
			json.dumps({
				'notes':_notes,
				}),
			'application/json')
	return render_to_response('statistics/statistic_list.html',{
		'notes_list':notes,
		},context_instance=RequestContext(request))

def detail(request,statistic_id):
	statistic = get_object_or_404(Statistic,pk=statistic_id)
	from charts.views import detail as chart_detail
	redirect_uri = reverse(chart_detail,args=[statistic.chart.id])
	return HttpResponseRedirect(redirect_uri)
	
def save(request):
	if request.method != "POST":
		raise Http404
	if 'chart_id' not in request.POST or 'tags' not in request.POST:
		return HttpResponseBadRequest("Insufficent Arguments")
	statistic = save_statistic(request)
	if request.is_ajax():
		return HttpResponse(
			json.dumps({
				'message':"Saved",
				'statistic':{
					'id':statistic.id,
					'chart':statistic.chart.id,
					'tags':request.POST['tags'].split(","),
				}
				}),
			'application/json')
	return HttpResponseRedirect(reverse(detail,args=[statistic.id]))

def save_statistic(request):
	if 'chart_id' not in request.POST or 'tags' not in request.POST:
		return False
	chart_id = int(request.POST['chart_id'])
	chart = get_object_or_404(Chart,pk=chart_id)
	statistic = Statistic(
		chart = chart,
		votes = 1,
	)
	statistic.save()
	tags = []
	for short in request.POST['tags'].split(","):
		try:
			tags.append(Tag.objects.filter(short=short).get())
		except ObjectDoesNotExist:
			short = False
	
	statistic.tags = tags
	return statistic