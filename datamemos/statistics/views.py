from models import Statistic
from charts.models import Chart, Tag
from django.http import HttpResponse, HttpResponseBadRequest, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404
from django.core.urlresolvers import reverse

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
	from charts.views import detail as chart_detail
	redirect_uri = reverse(chart_detail,args=[statistic.chart.id])
	return HttpResponseRedirect(redirect_uri)
	
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
				'message':"Saved",
				'statistic':{
					'id':statistic.id,
					'chart':statistic.chart.id,
					'tags':request.POST['tags'].split(","),
				}
				}),
			'application/json')
	return HttpResponse("Gotta write save function")