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
	
	weight = models.PositiveIntegerField(blank=True, null=True, default=1)
	
	def __unicode__(self):
		return self.text