from django import forms
from django.forms import ModelForm
from models import Note

class NoteForm(ModelForm):
	class Meta:
		model = Note
		fields = ('text', 'public')
		
class AuthorForm(forms.Form):
	name = forms.CharField()
	email = forms.EmailField()