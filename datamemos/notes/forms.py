from django import forms
from django.forms import ModelForm
from models import Note, Category

def make_note_form(user = False):	
	class NoteForm(ModelForm):
		if user and user.is_staff:
			categories = Category.objects
		else:
			categories = Category.objects.filter(public=True)
			
		if categories.count() > 1:
			type_widget = forms.RadioSelect
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
		
		class Meta:
			model = Note
			fields = ('text', 'type','public')
	return NoteForm