from django.db import models

from notes.models import Note
from data_xls.models import Xls

class Statistic(models.Model):
	note = models.ForeignKey(Note,null=True,blank=True)
	xls = models.ForeignKey(Xls)
	votes = models.IntegerField()
	
	def __unicode__(self):
		return self.xls.title

class Filter(models.Model):
	statistic = models.ForeignKey(Statistic)
	name = models.CharField(max_length=50)
	value = models.CharField(max_length=50)
	
	def __unicode(self):
		return self.name+"::"+self.value