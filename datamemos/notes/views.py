from models import Note
from statistics.models import Statistic
from django.template import Context, loader
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
import datetime

from django.core.exceptions import ObjectDoesNotExist

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
			if 'statistics' in request.POST:
				for stat_id in request.POST['statistics']:
					try:
						statistic = Statistic.objects.filter(id=int(stat_id)).get()
						note.statistic_set.add(statistic)
					except ObjectDoesNotExist:
						stat_id = False
			return HttpResponseRedirect(reverse(detail, args=(note.id,)))
	return render_to_response('notes/form.html',{'form':form},context_instance=RequestContext(request))
