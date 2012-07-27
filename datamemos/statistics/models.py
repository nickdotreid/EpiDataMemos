from django.db import models

from notes.models import Note
from charts.models import Chart, Tag

class Statistic(models.Model):
	chart = models.ForeignKey(Chart)
	
	note = models.ForeignKey(Note,null=True,blank=True)
	tags = models.ManyToManyField(Tag, blank=True)
	
	votes = models.PositiveIntegerField()
	
	def __unicode__(self):
		return self.chart.title