from models import Note
from django.contrib.auth.models import User

from statistics.views import save_statistic
from django.template import Context, loader
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template.loader import render_to_string
from django.core.urlresolvers import reverse
import datetime

from django.core.exceptions import ObjectDoesNotExist

import json

from forms import make_note_form
from django.template import RequestContext

def detail(request, note_id):
	note = get_object_or_404(Note,pk=note_id)
	return render_to_response('notes/detail.html',{'note':note})

def create(request):
	if request.user.is_authenticated():
		NoteForm = make_note_form(request.user)
	else:
		NoteForm = make_note_form()
	form = NoteForm()
	if request.method == 'POST':
		form = NoteForm(request.POST)
		if form.is_valid():
			if request.user.is_authenticated():
				author = request.user
			else:
				if 'email' in form.cleaned_data:
					users_list = User.objects.filter(email=form.cleaned_data['email'])
					if len(users_list) > 0:
						author = users_list[0]
					else:
						user = User()
						user.username = form.cleaned_data['email']
						user.email = form.cleaned_data['email']
						user.save()
						author = user
					#log in author??
			note = Note(
				text = form.cleaned_data['text'],
				type = form.cleaned_data['type'],
				pub_date = datetime.datetime.now(),
				author = author,
				)
			if 'public' in form.cleaned_data:
				note.public = True
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
