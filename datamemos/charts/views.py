from models import Chart
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404

from django.template import RequestContext

import json

from parse_data import *

def detail(request,chart_id):
	chart = get_object_or_404(Chart,pk=chart_id)
	columns = []
	rows = []
	for tag in chart.columns.all():
		#only append if points length > 0
		col = {
			'label':tag.name,
			'short':tag.short,
			'points':[],
		}
		for point in chart.point_set.filter(tags__in=[tag.id]).distinct():
			_rows = []
			for row in point.tags.all():
				if row != tag:
					_rows.append(row.short)
					if row not in rows:
						rows.append(row)
			col['points'].append({
				'value':point.value,
				'rows':_rows,
				})
		if len(col['points']) > 0:
			columns.append(col)
	_rows = []
	for row in rows:
		# check for parent groupings
		# check to make sure chart allows row
		_rows.append({
			'label':row.name,
			'short':row.short,
		})
	#should sort rows
	if request.is_ajax():
		# fetch data from file
		return HttpResponse(
			json.dumps({
				'title':chart.title,
				'description':chart.description,
				'columns':columns,
				'rows':_rows,
				}),
			'application/json')
	return render_to_response('charts/chart_detail.html',{
		'chart':chart,
		'columns':columns,
		'rows':rows,
		},context_instance=RequestContext(request))