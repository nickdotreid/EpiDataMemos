from django.shortcuts import render_to_response, get_object_or_404

from django.template import RequestContext

from charts.models import Chart

import json

def show_home(request):
	return render_to_response('homepage/homepage.html',context_instance=RequestContext(request))

def load_chart(request):
	return render_to_response('homepage/chart.html',{
		'charts':Chart.objects.all(),
	},context_instance=RequestContext(request))