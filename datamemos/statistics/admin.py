from statistics.models import Statistic
from django.contrib import admin

class StatisticAdmin(admin.ModelAdmin):
	fields = ['note','chart','tags','votes']

admin.site.register(Statistic,StatisticAdmin)