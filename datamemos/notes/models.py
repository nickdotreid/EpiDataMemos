from django.db import models
from django.contrib.auth.models import User
import datetime

class Note(models.Model):
	author = models.ForeignKey(User,null=True,blank=True)
	text = models.CharField(max_length=500)
	pub_date = models.DateTimeField('date published')
	
	public = models.BooleanField(default=False)
	
	def was_published_today(self):
	    return self.pub_date.date() == datetime.date.today()
	was_published_today.short_description = 'Published today?'
	
	def __unicode__(self):
		return self.text