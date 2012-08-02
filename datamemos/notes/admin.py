from notes.models import Note
from statistics.admin import StatisticInline
from django.contrib import admin

class NoteAdmin(admin.ModelAdmin):
	list_filter = ['pub_date']
	list_display = ('text', 'type', 'pub_date')
	fieldsets = [
	        (None,               {'fields': ['text','type']}),
	        ('Author Information', {'fields': ['author','pub_date','public']}),
	    ]
	inlines = [StatisticInline]

admin.site.register(Note,NoteAdmin)