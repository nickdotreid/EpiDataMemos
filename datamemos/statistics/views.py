from models import Statistic
from charts.models import Chart, Tag
from django.http import HttpResponse, HttpResponseBadRequest, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404

from django.template import RequestContext
from django.core.exceptions import ObjectDoesNotExist

import json

def list(request):
	# look for order param
	# look for limit param
	# look for filter param
	statistics = Statistic.objects.all()
	return render_to_response('statistics/statistic_list.html',{
		'statistic_list':statistics
		},context_instance=RequestContext(request))

def detail(request,statistic_id):
	statistic = get_object_or_404(Statistic,pk=statistic_id)
	if request.is_ajax():
		return HttpResponse(
			json.dumps({
				'title':statistic.chart.title,
				}),
			'application/json')
	# should redirect with filters!!
	return HttpResponse("Statistic for "+statistic.chart.title)
	
def save(request):
	if request.method != "POST":
		raise Http404
	if 'chart_id' not in request.POST or 'tags' not in request.POST:
		return HttpResponseBadRequest("Insufficent Arguments")
	chart_id = int(request.POST['chart_id'])
	chart = get_object_or_404(Chart,pk=chart_id)
	tags = []
	for short in request.POST['tags'].split(","):
		try:
			tags.append(Tag.objects.filter(short=short).get())
		except ObjectDoesNotExist:
			short = False
	statistic = Statistic(
		chart = chart,
		votes = 1,
	)
	statistic.save()
	statistic.tags = tags
	if request.is_ajax():
		return HttpResponse(
			json.dumps({
				'message':"Should send you ajax response or errors",
				}),
			'application/json')
	return HttpResponse("Gotta write save function")