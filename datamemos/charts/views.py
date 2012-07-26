from models import Chart
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404

from django.template import RequestContext

import json

from parse_data import *

def detail(request,chart_id):
	chart = get_object_or_404(Chart,pk=chart_id)
	if request.is_ajax():
		# fetch data from file
		return HttpResponse(
			json.dumps({
				'title':chart.title,
				'description':chart.description,
				}),
			'application/json')
	return render_to_response('charts/xls_detail.html',{'chart':chart},context_instance=RequestContext(request))