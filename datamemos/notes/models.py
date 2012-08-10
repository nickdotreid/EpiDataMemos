from django.db import models
from django.contrib.auth.models import User
import datetime


class Category(models.Model):
	name = models.CharField(blank=True, max_length=100)
	short = models.CharField(max_length=50, unique=True)
	
	public = models.BooleanField(default=False)
	viewable = models.BooleanField(default=True)
	
	def __unicode__(self):
		return self.short

class Note(models.Model):
	author = models.ForeignKey(User,null=True,blank=True)
	text = models.TextField(blank=True)
	pub_date = models.DateTimeField('date published')
	
	type = models.ForeignKey(Category,null=True,blank=True)
	
	public = models.BooleanField(default=False)
	
	weight = models.PositiveIntegerField(blank=True, null=True, default=1)
	
	def __unicode__(self):
		return self.text