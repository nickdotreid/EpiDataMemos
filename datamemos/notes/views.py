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

from forms import NoteForm, AuthorForm
from django.template import RequestContext

def detail(request, note_id):
	note = get_object_or_404(Note,pk=note_id)
	return render_to_response('notes/detail.html',{'note':note})

def create(request):
	form = NoteForm()
	author_form = False
	if not request.user.is_authenticated():
		author_form = AuthorForm()
	if request.method == 'POST':
		author = False
		if request.user.is_authenticated():
			author = request.user
		else:
			author_form = AuthorForm(request.POST)
			if author_form.is_valid() and 'email' in author_form.cleaned_data and 'name' in author_form.cleaned_data:
				# check if email exists
				user = User()
				user.email = author_form.cleaned_data['email']
				user.username = author_form.cleaned_data['name']
				user.save()
				# log in user
				author = user
		form = NoteForm(request.POST)
		if form.is_valid() and author:
			note = Note(
				text = form.cleaned_data['text'],
				type = 'comment',
				pub_date = datetime.datetime.now()
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
					"author_form":author_form,
					"extra_css":"ajax"
					})
				}),
			'application/json')
	return render_to_response('notes/edit.html',{'form':form},context_instance=RequestContext(request))
