from django.shortcuts import render_to_response, get_object_or_404

from django.template import RequestContext

import json

def show_home(request):
	return render_to_response('homepage/homepage.html')