from models import Note
from statistics.views import save_statistic
from django.template import Context, loader
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template.loader import render_to_string
from django.core.urlresolvers import reverse
import datetime

from django.core.exceptions import ObjectDoesNotExist

import json

from forms import NoteForm
from django.template import RequestContext

def detail(request, note_id):
	note = get_object_or_404(Note,pk=note_id)
	return render_to_response('notes/detail.html',{'note':note})

def create(request):
	form = NoteForm()
	if request.method == 'POST':
		form = NoteForm(request.POST)
		if form.is_valid():
			note = Note(
				text = form.cleaned_data['text'],
				type = 'comment',
				pub_date = datetime.datetime.now()
				)
			if 'public' in form.cleaned_data:
				note.public = True
			if request.user.is_authenticated():
				note.author = request.user
			note.save()
			# should send out node saved doo-hicky?
			statistic = save_statistic(request)
			if statistic:
				note.statistic_set.add(statistic)
			if request.is_ajax:
				return HttpResponse(
					json.dumps({
						"note":{
							"id":note.id,
							"text":note.text,
						}
						}),
					'application/json')
			return HttpResponseRedirect(reverse(detail, args=(note.id,)))
	if request.is_ajax():
		return HttpResponse(
			json.dumps({
				"form":render_to_string("notes/form.html",{
					"form":form,
					"extra_css":"ajax"
					})
				}),
			'application/json')
	return render_to_response('notes/edit.html',{'form':form},context_instance=RequestContext(request))
