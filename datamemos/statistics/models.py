from django.db import models

from notes.models import Note
from charts.models import Chart, Tag

class Statistic(models.Model):
	chart = models.ForeignKey(Chart,null=True,blank=True)
	
	note = models.ForeignKey(Note,null=True,blank=True)
	tags = models.ManyToManyField(Tag, blank=True)
	
	def __unicode__(self):
		if self.chart:
			return self.chart.title
		return unicode(self.id)