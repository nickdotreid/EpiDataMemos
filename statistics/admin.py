from statistics.models import Statistic,Filter
from django.contrib import admin

class FilterInline(admin.TabularInline):
    model = Filter
    extra = 1

class StatisticAdmin(admin.ModelAdmin):
	fields = ['note','xls','votes']
	inlines = [FilterInline]

admin.site.register(Statistic,StatisticAdmin)
admin.site.register(Filter)