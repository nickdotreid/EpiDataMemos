from django.db import models
from adminsortable.models import Sortable

from django.contrib.auth.models import User

class Tag(Sortable):
	
	short = models.CharField(unique=True, max_length=50)
	name = models.CharField(max_length=100)
	
	parent = models.ForeignKey('self', null=True, blank=True, related_name='children')
	
	class Meta(Sortable.Meta):
		pass
	
	def transfer_to(self,new_tag):
		if isinstance(new_tag,int):
			new_tag = Tag.objects.get(id=new_tag)
		if not isinstance(new_tag,Tag):
			return False
		for point in self.point_set.all():
			point.tags.add(new_tag)
		self.delete()
		return True
	
	def __unicode__(self):
		if self.name:
			return self.name
		return self.short

class Chart(models.Model):
	title = models.CharField(max_length=200)
	description = models.CharField(max_length=250,blank=True)
	
	xls = models.FileField(upload_to='xls/',blank=True,null=True)
	
	author = models.ForeignKey(User,null=True,blank=True)
	pub_date = models.DateTimeField('date published')
	published = models.BooleanField(default=True)
	
	columns = models.ManyToManyField(Tag, blank=True)
	
	x_label = models.CharField(max_length=250,blank=True)
	y_label = models.CharField(max_length=250,blank=True)
	
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