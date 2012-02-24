from data_xls.models import Xls
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404

from django.template import RequestContext

import json

def load_chart(request,xls_id):
	xls = get_object_or_404(Xls,pk=xls_id)
	return render_to_response('charts/chart.html',{'xls':xls},context_instance=RequestContext(request))