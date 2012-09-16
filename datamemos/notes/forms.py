from django import forms
from django.forms import ModelForm
from models import Note, Category, Bookmark

from charts.models import Chart, Tag

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

def make_note_form(user = False):	
	class NoteForm(ModelForm):
		if user and user.is_staff:
			categories = Category.objects
		else:
			categories = Category.objects.filter(public=True)
			
		if categories.count() > 1:
			type_widget = forms.Select
		else:
			type_widget = forms.HiddenInput
		initial = None
		if categories.count() > 0:
			initial = categories.all()[0]
		type = forms.ModelChoiceField(
			widget = type_widget,
			label = "File this note as a",
			required = True,
			queryset = categories,
			empty_label = None,
			initial = initial,
		)
		
		if not user:
			email = forms.EmailField()
		
		text = forms.CharField(
			widget = forms.Textarea,
			label = 'Your note or insite to share',
		)
		
		public = forms.BooleanField(
			label = 'Do you want to list this comment publicly?',
			required = False,
		)
		
		class Meta:
			model = Note
			if not user:
				fields = ('text', 'email','public')
			else:
				fields = ( 'type','text','public')
		def __init__(self, *args, **kwargs):
			self.helper = FormHelper()
			self.helper.form_id = 'form-note'
			self.helper.form_class = 'ajax note create note-create'
			self.helper.form_method = 'post'
			self.helper.form_action = '/notes/create/'

			self.helper.add_input(Submit('submit', 'Save Note'))
			super(NoteForm, self).__init__(*args, **kwargs)
	return NoteForm

class BookmarkForm(ModelForm):
	
	text = forms.CharField(
		label = 'Title for Bookmark',
		required = False,
	)
	
	note = forms.ModelChoiceField(
		widget = forms.HiddenInput,
		required = False,
		queryset = Note.objects
	)
	
	chart = forms.ModelChoiceField(
		widget = forms.HiddenInput,
		required = False,
		queryset = Chart.objects
	)
	
	tags = forms.ModelMultipleChoiceField(
		widget = forms.HiddenInput,
		required = False,
		queryset = Chart.objects
	)
	
	class Meta:
		model = Bookmark
		fields = ('text','chart','tags','note')
	
	def __init__(self,*args,**kwargs):
		self.helper = FormHelper()
		self.helper.form_id = 'form-bookmark'
		self.helper.form_class = 'ajax bookmark create bookmark-create'
		self.helper.form_method = 'post'
		self.helper.form_action = '/notes/bookmark/'

		self.helper.add_input(Submit('submit', 'Save Bookmark'))
		super(BookmarkForm, self).__init__(*args, **kwargs)