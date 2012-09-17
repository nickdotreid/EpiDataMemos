from django.db import models
from adminsortable.models import Sortable
from django.contrib.auth.models import User
from charts.models import Chart, Tag

import datetime


class Category(Sortable):
	name = models.CharField(blank=True, max_length=100)
	short = models.CharField(max_length=50, unique=True)
	
	public = models.BooleanField(default=False)
	viewable = models.BooleanField(default=True)
	
	class Meta(Sortable.Meta):
		pass
	
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
	
	def as_json(self):
		import time
		obj = {
			'id':self.id,
			'author':self.author.email,
			'date':time.mktime(self.pub_date.timetuple()),
			'text':self.text,
			'type':self.type.short,
			'public':self.public,
			'weight':self.weight,
			'bookmarks':[],
		}
		for bookmark in self.bookmark_set.all():
			obj['bookmarks'].append(bookmark.as_json())
		return obj
		
class Bookmark(models.Model):
	text = models.CharField(blank=True, max_length=200)
	
	chart = models.ForeignKey(Chart,null=True,blank=True)
	
	note = models.ForeignKey(Note,null=True,blank=True)
	tags = models.ManyToManyField(Tag, blank=True)
	
	def as_json(self):
		obj = {
			'text':self.text,
			'tags':[]
		}
		if self.chart:
			obj['chart'] = {
				'id':self.chart.id,
				'title':self.chart.title,
			}
		if self.note:
			obj['note'] = {
				'id':self.note.id
			}
		for tag in self.tags.all():
			obj['tags'].append(tag.short)
		return obj
	
	def __unicode__(self):
		if self.chart:
			return self.chart.title
		return unicode(self.id)