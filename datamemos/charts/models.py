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
		
	def as_json(self):
		children = []
		for child in self.children.all():
			children.append(child.short)
		sibilings = []
		parent = False
		if self.parent:
			parent = self.parent.short
			for sibiling in self.parent.children.all():
				if sibiling != self:
					sibilings.append(sibiling.short)
		return {
			'short':self.short,
			'name':self.name,
			'children':children,
			'parent':parent,
		}
	
	def __unicode__(self):
		if self.name:
			return "%s (%s)" % (self.name,self.short)
		return self.short

class Chart(models.Model):
	title = models.CharField(max_length=200)
	description = models.CharField(max_length=250,blank=True)
	
	xls = models.FileField(upload_to='xls/',blank=True,null=True)
	
	author = models.ForeignKey(User,null=True,blank=True)
	pub_date = models.DateTimeField('date published')
	published = models.BooleanField(default=True)
	
	columns = models.ManyToManyField(Tag, blank=True)
	
	lock_percent = models.BooleanField(default=False)
	
	x_label = models.CharField(max_length=250,blank=True)
	y_label = models.CharField(max_length=250,blank=True)
	
	units = models.CharField(max_length=100,blank=True)
	
	def __unicode__(self):
		if self.published:
			return self.title
		return "UNPUBLISHED - " + self.title
		
class Footnote(Sortable):
	
	chart = models.ForeignKey(Chart)
	
	title = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	
	class Meta(Sortable.Meta):
		pass

class Point(models.Model):
	value = models.IntegerField()
	tags = models.ManyToManyField(Tag)
	chart = models.ForeignKey(Chart)
	
	def as_json(self):
		tags = []
		for tag in self.tags.all():
			tags.append(tag.short)
		return {
			'chart':self.chart.id,
			'tags':tags,
			'value':self.value,
		}
	
	def __unicode__(self):
		return self.chart.title + " - " + str(self.value)