from charts.models import Chart
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404
from django.template.loader import render_to_string

from django.template import RequestContext

import json

from charts.views import jsonify_chart_values

def load_chart(request,chart_id):
	chart = get_object_or_404(Chart,pk=chart_id)
	chart_values = jsonify_chart_values(chart)
	if request.is_ajax():
		footnotes = []
		for footnote in chart.footnote_set.all():
			footnotes.append({
				'id':footnote.id,
				'title':footnote.title,
				'description':footnote.description
			})
		author = False
		if chart.author:
			author = chart.author.email
		timestamp = False
		if chart.pub_date:
			import time
			timestamp = time.mktime(chart.pub_date.timetuple())
		return HttpResponse(
			json.dumps({
				'id':chart.id,
				'author':author,
				'date': timestamp,
				'title':chart.title,
				'lock_percent':chart.lock_percent,
				'threshold':chart.threshold,
				'description':chart.description,
				'footnotes':footnotes,
				'x_label':chart.x_label,
				'y_label':chart.y_label,
				'units': chart.units,
				'rows':chart_values['rows'],
				'columns':chart_values['columns'],
				'points':chart_values['points'],
				}),
			'application/json')
	return render_to_response('charts/chart.html',{
		'chart':chart,
		'columns':columns,
		'rows':rows,
		},context_instance=RequestContext(request))