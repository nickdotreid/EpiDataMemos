from notes.models import Note, Category, Bookmark
from adminsortable.admin import SortableAdmin,SortableTabularInline
from django.contrib import admin

class CategoryAdmin(SortableAdmin):
	fieldsets = [
		(None, {'fields':['name','short']}),
		("Display Information", {'fields':['viewable','public']})
	]
admin.site.register(Category,CategoryAdmin)

class BookmarkInline(admin.TabularInline):
	model = Bookmark
	extra = 2

class NoteAdmin(admin.ModelAdmin):
	list_filter = ['pub_date']
	list_display = ('text', 'type', 'pub_date')
	fieldsets = [
	        (None,               {'fields': ['text','type']}),
	        ('Author Information', {'fields': ['author','pub_date','public']}),
	    ]
	inlines = [BookmarkInline]

admin.site.register(Note,NoteAdmin)