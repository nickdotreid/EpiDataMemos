from models import Note, Bookmark, Category
from django.contrib.auth.models import User

from django.template import Context, loader
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, HttpResponseBadRequest, Http404, HttpResponseRedirect
from django.template.loader import render_to_string
from django.core.urlresolvers import reverse
import datetime

from django.core.exceptions import ObjectDoesNotExist

from annoying.functions import get_object_or_None

import json

from forms import make_note_form, BookmarkForm
from django.template import RequestContext

def list(request):
	objects = Note.objects
	if 'chart_id' in request.GET:
		if get_object_or_None(Chart,id=int(request.GET['chart_id'])):
			objects.filter(bookmark__chart__id=request.GET['chart_id'])
	if 'type' in request.GET:
		category = get_object_or_None(Category,short == request.GET['type'])
		objects.filter(type=category)
	if not request.user.is_staff:
		objects.filter(public=True)
	if request.is_ajax():
		_notes = []
		for note in objects.all():
			_notes.append(note.as_json())
		return HttpResponse(
			json.dumps({
				'notes':_notes,
				}),
			'application/json')
	return render_to_response('notes/list_page.html',{
		'notes':objects.all(),
		},context_instance=RequestContext(request))

def detail(request, note_id):
	note = get_object_or_404(Note,pk=note_id)
	if request.is_ajax():
		return HttpResponse(
			json.dumps({
				"note":note.as_json(),
				}),
			'application/json')
	return render_to_response('notes/detail.html',{'note':note})
	
def edit(request,note_id):
	note = get_object_or_404(Note,pk=note_id)
	if not request.user.is_authenticated():
		return HttpResponse(
			json.dumps({
				"message":{
					'type':'error',
					'text':"You don't have permission to edit this note.",
				},
				}),
			'application/json')
	NoteForm = make_note_form(request.user)
	form = NoteForm(instance=note)
	if request.method == 'POST':
		form = NoteForm(request.POST,instance=note)
		if form.is_valid():
			note.text = form.cleaned_data['text'],
			note.type = form.cleaned_data['type'],
			note.pub_date = datetime.datetime.now(),
			if 'public' in form.cleaned_data:
				note.public = True
			note.save()
			return HttpResponse(
				json.dumps({
					"message":{
						'type':'success',
						'text':"Your note has been updated",
					},
					"note":note.as_json(),
				}),
				'application/json')
	if request.is_ajax():
		return HttpResponse(
			json.dumps({
				"form":render_to_string("notes/form.html",{
					"form":form,
					},context_instance=RequestContext(request))
				}),
			'application/json')
	return render_to_response('notes/form_page.html',{'form':form},context_instance=RequestContext(request))
		

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
			note = Note(
				text = form.cleaned_data['text'],
				type = form.cleaned_data['type'],
				pub_date = datetime.datetime.now(),
				author = author,
				)
			if 'public' in form.cleaned_data:
				note.public = True
			note.save()
			if request.is_ajax:
				return HttpResponse(
					json.dumps({
						"message":{
							'type':'success',
							'text':"Your note has been saved",
						},
						"note":note.as_json(),
						}),
					'application/json')
			return HttpResponseRedirect(reverse(detail, args=(note.id,)))
	if request.is_ajax():
		return HttpResponse(
			json.dumps({
				"form":render_to_string("notes/form.html",{
					"form":form,
					},context_instance=RequestContext(request))
				}),
			'application/json')
	return render_to_response('notes/form_page.html',{'form':form},context_instance=RequestContext(request))
	
def save_bookmark(request,bookmark_id = False):
	form = BookmarkForm()
	bookmark = get_object_or_None(Bookmark,pk=bookmark_id)
	if bookmark:
		form = BookmarkForm(instance=bookmark)
		if not request.user.is_authenticated() or (not request.user.is_staff and (bookmark.note.author == request.user)):
			return HttpResponse(
				json.dumps({
					"message":{
						'type':'error',
						'text':"You don't have permission to edit this bookmark.",
					},
					}),
				'application/json')
	if request.method == "POST":
		if bookmark:
			form = BookmarkForm(request.POST, instance=bookmark)
		else:
			form = BookmarkForm(request.POST)
		if form.is_valid():
			if not bookmark:
				bookmark = Bookmark()
				bookmark.save()
			if 'text' in form.cleaned_data:
				bookmark.text = form.cleaned_data['text']
			if 'chart' in form.cleaned_data:
				bookmark.chart = form.cleaned_data['chart']
			if 'tags' in form.cleaned_data:
				bookmark.tags = form.cleaned_data['tags']
			if 'note' in form.cleaned_data:
				bookmark.note = form.cleaned_data['note']			
			bookmark.save()
			return HttpResponseRedirect(reverse(save_bookmark, kwargs={
				"bookmark_id":bookmark.id,
				}))
	return render_to_response('notes/form_page.html',{'form':form},context_instance=RequestContext(request))
		
	
