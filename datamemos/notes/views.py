from models import Note, Bookmark, Category
from charts.models import Chart, Tag
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
	query = Note.objects
	if 'chart_id' in request.GET:
		chart = get_object_or_None(Chart,id = int(request.GET['chart_id']))
		if chart:
			query = query.filter(bookmark__chart__id = chart.id)
	if 'type' in request.GET:
		category = get_object_or_None(Category,short = request.GET['type'])
		query = query.filter(type=category)
	if not request.user.is_staff:
		query = query.filter(public=True)
	if request.is_ajax():
		_notes = []
		for note in query.all():
			_note = note.as_json()
			_note['url'] = request.get_host()+reverse(detail, args=(note.id,))
			if request.user.is_authenticated() and (note.author == request.user or request.user.is_staff):
				_note['editable'] = True 
			if request.user.is_authenticated() and request.user.is_staff:
				_note['managable'] = True
			_notes.append(_note)
		return HttpResponse(
			json.dumps({
				'notes':_notes,
				}),
			'application/json')
	return render_to_response('notes/list_page.html',{
		'notes':query.all(),
		},context_instance=RequestContext(request))

def detail(request, note_id):
	note = get_object_or_404(Note,pk=note_id)
	if request.is_ajax():
		_note = note.as_json()
		_note['url'] = request.get_host()+reverse(detail, args=(note.id,))
		if request.user.is_authenticated() and (note.author == request.user or request.user.is_staff):
			_note['editable'] = True
		if request.user.is_authenticated() and request.user.is_staff:
			_note['managable'] = True
		return HttpResponse(
			json.dumps(_note),
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
			_note = note.as_json()
			_note['url'] = request.get_host()+reverse(detail, args=(note.id,))
			if request.user.is_authenticated() and (note.author == request.user or request.user.is_staff):
				_note.editable = True
			if request.user.is_authenticated() and request.user.is_staff:
				_note['managable'] = True
			return HttpResponse(
				json.dumps(_note),
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

def change_weight(request,note_id):
	note = get_object_or_404(Note,pk=note_id)
	if not request.user.is_staff:
		return HttpResponse(
			json.dumps({
				"message":{
					'type':'error',
					'text':"You don't have permission to edit this note.",
				},
				}),
			'application/json')
	if request.method == 'POST' and 'amount' in request.POST:
		note.weight += int(request.POST['amount'])
		note.save()
	return HttpResponse(
		json.dumps({
			"weight":note.weight,
			}),
		'application/json')
	return HttpResponseRedirect(reverse(detail, args=(note.id,)))

def get_note_form(request):
	if request.user.is_authenticated() and request.user.is_staff:
		if request.GET and 'category' in request.GET:
			cat = get_object_or_None(Category,short=request.GET['category'])
			if cat:
				NoteForm = make_note_form(request.user,category=cat)
		return make_note_form(request.user)
	return make_note_form()
	

def create(request):
	NoteForm = get_note_form(request)
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
			save_bookmark_to_note(request,note)
			send_note_email(note,request.get_host())
			if request.is_ajax:
				_note = note.as_json()
				_note['url'] = request.get_host()+reverse(detail, args=(note.id,))
				if request.user.is_authenticated() and (note.author == request.user or user.is_staff):
					_note['editable'] = True
				return HttpResponse(
					json.dumps(_note),
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

def send_note_email(note,root_url=""):
	from django.core.mail import send_mail
	subject = "Your note"
	if(note.bookmark_set.count() > 0):
		subject += " on " + note.bookmark_set.all()[0].chart.title
	message = render_to_string("notes/email.html",{
		"view_url":root_url+reverse(detail, args=(note.id,)),
		"edit_url":root_url+reverse(edit, args=(note.id,))
		})
	send_mail(subject, message, 'charts@sfhiv.org', [note.author.email], fail_silently=False)

def save_bookmark_to_note(request,note):
	saved_bookmarks = 0
	if request.method == 'POST':
		if 'bookmarks' in request.POST:
			for bookmark_id in request.POST['bookmarks'].split(","):
				if bookmark_id != '':
					bookmark = get_object_or_None(Bookmark,pk=bookmark_id)
					if bookmark:
						bookmark.note = note
						bookmark.save()
		chart = False
		tags = []
		if 'chart_id' in request.POST:
			chart = get_object_or_None(Chart,pk=request.POST['chart_id'])
		if 'tags' in request.POST:
			for short in request.POST['tags'].split(','):
				if short!='':
					tag = get_object_or_None(Tag,short=short)
					if tag:
						tags.append(tag)
		if chart:
			bookmark = Bookmark()
			bookmark.chart = chart
			bookmark.note = note
			bookmark.save()
			bookmark.tags = tags
	return saved_bookmarks
	
def save_bookmark(request,bookmark_id = False):
	if request.is_ajax:
		return ajax_save_bookmark(request,bookmark_id)
	form = BookmarkForm()
	bookmark = get_object_or_None(Bookmark,pk=bookmark_id)
	if bookmark:
		form = BookmarkForm(instance=bookmark)
		if not request.user.is_authenticated() or (not request.user.is_staff and (bookmark.note.author == request.user)):
			return HttpResponseRedirect(reverse(list, args=(note.id,)))
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

def ajax_save_bookmark(request,bookmark_id = False):
	bookmark = get_object_or_None(Bookmark,pk=bookmark_id)
	if request.method == "POST":
		if 'chart_id' not in request.POST or 'tags' not in request.POST:
			return HttpResponse(
				json.dumps({
					"message":{
						'type':'error',
						'text':"Can't save bookmark",
					},
					}),
				'application/json')
		if not bookmark:
			bookmark = Bookmark()
			bookmark.save()
		if 'chart_id' in request.POST:
			chart = get_object_or_None(Chart,pk=request.POST['chart_id'])
			if chart:
				bookmark.chart = chart
		if 'tags' in request.POST:
			for short in request.POST['tags'].split(','):
				tag = get_object_or_None(Tag,short=short)
				if tag:
					bookmark.tags.add(tag)
		if 'note_id' in request.POST:
			note = get_object_or_None(Note,pk=request.POST['note_id'])
			if note:
				bookmark.note = note
			else:
				bookmark.note = False
		bookmark.save()
		_bookmark = bookmark.as_json()
		_bookmark['url'] = request.get_host()+reverse(save_bookmark, args=(bookmark.id,))
		return HttpResponse(
			json.dumps({
				"message":{
					'type':'success',
					'text':"Bookmark saved",
				},
				"bookmarks":[_bookmark],
				}),
			'application/json')
	return HttpResponse(
		json.dumps({
			"message":{
				'type':'error',
				'text':"Use post",
			},
			}),
		'application/json')
			
		
	
