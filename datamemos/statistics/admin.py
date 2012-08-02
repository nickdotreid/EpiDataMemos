from statistics.models import Statistic
from django.contrib import admin

class StatisticInline(admin.TabularInline):
	model = Statistic
	extra = 2

class StatisticAdmin(admin.ModelAdmin):
	fields = ['note','chart','tags','votes']

admin.site.register(Statistic,StatisticAdmin)