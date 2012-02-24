from django.db import models

from notes.models import Note
from data_xls.models import Xls

class Description(models.Model):
	name = models.CharField(max_length=150)
	slug = models.CharField(max_length=150, null=True, blank=True)
	text = models.CharField(max_length=500, blank=True)
	
	def __unicode__(self):
		return self.name

class Term(models.Model):
	description = models.ForeignKey(Description, null=True, blank=True)
	text = models.CharField(max_length=500)
	
	def __unicode(self):
		return self.name+"::"+self.text