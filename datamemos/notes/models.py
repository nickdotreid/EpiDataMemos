from django.db import models
from django.contrib.auth.models import User
import datetime

class Note(models.Model):
	NOTE_TYPES = (
		("comment","Comment"),
		("definition","Definition"),
	)
	
	author = models.ForeignKey(User,null=True,blank=True)
	text = models.TextField(blank=True)
	pub_date = models.DateTimeField('date published')
	
	type = models.CharField(blank=True, null=True, max_length=20, choices=NOTE_TYPES)
	
	public = models.BooleanField(default=False)
	
	def was_published_today(self):
	    return self.pub_date.date() == datetime.date.today()
	was_published_today.short_description = 'Published today?'
	
	def __unicode__(self):
		return self.text