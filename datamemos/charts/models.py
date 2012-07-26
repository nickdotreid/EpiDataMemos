from django.db import models
from django.contrib.auth.models import User

class Tag(models.Model):
	short = models.CharField(unique=True, max_length=15)
	name = models.CharField(max_length=100)
	
	def __unicode__(self):
		return self.short

class Chart(models.Model):
	title = models.CharField(max_length=200)
	description = models.CharField(max_length=250,blank=True)
	
	xls = models.FileField(upload_to='xls/',blank=True,null=True)
	
	author = models.ForeignKey(User,null=True,blank=True)
	pub_date = models.DateTimeField('date published')
	published = models.BooleanField(default=True)
	
	def __unicode__(self):
		if self.published:
			return self.title
		return "UNPUBLISHED - " + self.title

class Point(models.Model):
	value = models.IntegerField()
	tags = models.ManyToManyField(Tag)
	chart = models.ForeignKey(Chart)
	
	def __unicode__(self):
		return self.chart.title + " - " + str(self.value)