from descriptions.models import Description,Term
from django.contrib import admin

class TermInline(admin.TabularInline):
    model = Term
    extra = 1

class DescriptionAdmin(admin.ModelAdmin):
	fields = ['name','slug','text']
	inlines = [TermInline]

admin.site.register(Description,DescriptionAdmin)
admin.site.register(Term)