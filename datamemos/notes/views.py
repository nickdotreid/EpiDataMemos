from notes.models import Note
from django.template import Context, loader
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
import datetime

from django import forms

from django.template import RequestContext

def detail(request, note_id):
	note = get_object_or_404(Note,pk=note_id)
	return render_to_response('notes/detail.html',{'note':note})

class NoteForm(forms.Form):
	text = forms.CharField(400)
	public = forms.BooleanField(required=False)

def create(request):
	if request.method == 'POST':
		form = NoteForm(request.POST)
		if form.is_valid():
			note_text = form.cleaned_data['text']
			note = Note(text=note_text,
				pub_date=datetime.datetime.now())
			if request.user.is_authenticated():
				note.author = request.user
			note.save()
			return HttpResponseRedirect(reverse('notes.views.detail', args=(note.id,)))
	form = NoteForm()
	return render_to_response('notes/form.html',{'form':form},context_instance=RequestContext(request))
