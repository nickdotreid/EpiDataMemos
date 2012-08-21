from charts.models import Chart
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404
from django.template.loader import render_to_string

from django.template import RequestContext

import json

from charts.views import get_chart_values

def load_chart(request,chart_id):
	chart = get_object_or_404(Chart,pk=chart_id)
	chart_data = get_chart_values(chart)
	columns = chart_data['columns']
	rows = chart_data['rows']
	if request.is_ajax():
		return HttpResponse(
			json.dumps({
				'id':chart.id,
				'title':chart.title,
				'markup':render_to_string("charts/barchart.html",{
					'chart':chart,
					'columns':columns,
					'rows':rows,
					}),
				}),
			'application/json')
	return render_to_response('charts/chart.html',{
		'chart':chart,
		'columns':columns,
		'rows':rows,
		},context_instance=RequestContext(request))