from models import Xls
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404

from django.template import RequestContext

import json

from parse_data import *

def detail(request,xls_id):
	xls = get_object_or_404(Xls,pk=xls_id)
	if request.is_ajax():
		# fetch data from file
		data = parse_data_file(xls.xls.path)
		return HttpResponse(
			json.dumps({'title':xls.title,'description':xls.description,'file':xls.xls.name,'columns':data['columns'],'order':data['order']}),
			'application/json')
	return render_to_response('data_xls/xls_detail.html',{'xls':xls},context_instance=RequestContext(request))