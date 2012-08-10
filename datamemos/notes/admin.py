from notes.models import Note, Category
from statistics.admin import StatisticInline
from django.contrib import admin

class CategoryAdmin(admin.ModelAdmin):
	fieldsets = [
		(None, {'fields':['name','short']}),
		("Display Information", {'fields':['viewable','public']})
	]
admin.site.register(Category,CategoryAdmin)

class NoteAdmin(admin.ModelAdmin):
	list_filter = ['pub_date']
	list_display = ('text', 'type', 'pub_date')
	fieldsets = [
	        (None,               {'fields': ['text','type']}),
	        ('Author Information', {'fields': ['author','pub_date','public']}),
	    ]
	inlines = [StatisticInline]

admin.site.register(Note,NoteAdmin)