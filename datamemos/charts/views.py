from models import Chart, Tag
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404

from django.template import RequestContext
from django.template.loader import render_to_string

import json

from parse_data import *

def get_chart_values(chart):
	columns = []
	rows = []
	for tag in chart.columns.all():
		col = {
			'label':tag.name,
			'short':tag.short,
			'points':[],
		}
		for point in chart.point_set.filter(tags__in=[tag.id]).distinct():
			_rows = []
			for row in point.tags.all():
				if row != tag and isinstance(row,Tag):
					_rows.append(row)
					if row not in rows:
						rows.append(row)
			col['points'].append({
				'id':point.id,
				'value':point.value,
				'rows':_rows,
				})
		if len(col['points']) > 0:
			columns.append(col)
	parents = []
	for row in rows:
		if row.parent and row.parent not in parents:
			parents.append(row.parent)
	for parent in parents:
		for column in columns:
			total = 0
			for point in column['points']:
				add = False
				for row in point['rows']:
					if row in parent.children.all():
						add = True
				if add:
					total += point['value']
			for point in column['points']:
				add = False
				for row in point['rows']:
					if row in parent.children.all():
						add = True
				if add:
					point['total'] = total
					point['percent'] = float(point['value'])/float(point['total'])
	def sort_rows(a,b):
		if(a.order>b.order):
			return 1
		return -1
	rows.sort(sort_rows)
	_rows = []
	for row in rows:
		if row.parent is None:
			_rows.append(row_to_object(row))
	_parents = []
	for parent in parents:
		_parents.append(row_to_object(parent))
	for parent in _parents:
		_parent = parent
		_parent['children'] = []
		for row in rows:
			if row.parent and row.parent.short == parent['short']:
				_parent['children'].append(row_to_object(row))
		_rows.append(_parent)
	return {
		'columns':columns,
		'rows':_rows,
	}


def jsonify_chart_values(chart):
	chart_data = get_chart_values(chart)
	columns = chart_data['columns']
	rows = chart_data['rows']
	_points = []
	_rows = []
	raw_rows = []
	_columns = []
	for col in chart.columns.all():
		_columns.append(col.as_json())
		for point in col.point_set.all():
			_points.append(point.as_json())
			for row in point.tags.all():
				if row not in raw_rows and chart not in row.chart_set.all():
					raw_rows.append(row)
					if row.parent and row.parent not in raw_rows and chart not in row.parent.chart_set.all():
						raw_rows.append(row.parent)
	def sort_rows(a,b):
		if(a.order>b.order):
			return 1
		return -1
	raw_rows.sort(sort_rows)
	for row in raw_rows:
		_rows.append(row.as_json())
	return {
		'columns':_columns,
		'rows':_rows,
		'points':_points,
	}

def row_to_object(row):
	_row = {}
	_row['name'] = row.name
	_row['short'] = row.short
	return _row
	
def list(request):
	charts = Chart.objects
	if not request.user.is_staff:
		charts = Chart.objects.filter(public=True)
	if request.is_ajax():
		_charts = []
		for chart in charts.all():
			_charts.append({
				'id':chart.id,
				'title':chart.title,
				'description':chart.description,
				'markup':render_to_string("charts/short.html",{
					'chart':chart,
					}),
			})
		return HttpResponse(
			json.dumps({
				'charts':_charts,
				}),
			'application/json')
	return render_to_response('charts/chart_list.html',{
		'charts':charts.all(),
		},context_instance=RequestContext(request))
	
def detail(request,chart_id):
	chart = get_object_or_404(Chart,pk=chart_id)
	chart_data = get_chart_values(chart)
	columns = chart_data['columns']
	rows = chart_data['rows']
	if request.is_ajax():
		return HttpResponse(
			json.dumps({
				'title':chart.title,
				'description':chart.description,
				'columns':columns,
				'rows':rows,
				'markup':render_to_string("charts/table.html",{
					'chart':chart,
					'columns':columns,
					'rows':rows,
					}),
				}),
			'application/json')
	return render_to_response('charts/chart_detail.html',{
		'chart':chart,
		'columns':columns,
		'rows':rows,
		},context_instance=RequestContext(request))