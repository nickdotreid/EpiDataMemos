from notes.models import Note
from django.contrib import admin

class NoteAdmin(admin.ModelAdmin):
	list_filter = ['pub_date']
	list_display = ('text', 'type', 'pub_date', 'was_published_today')
	fieldsets = [
	        (None,               {'fields': ['text','type']}),
	        ('Author Information', {'fields': ['author','pub_date']}),
	    ]

admin.site.register(Note,NoteAdmin)