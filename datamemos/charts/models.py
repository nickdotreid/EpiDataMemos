from django.db import models

class Xls(models.Model):
	title = models.CharField(max_length=200)
	description = models.CharField(max_length=250,blank=True)
	xls = models.FileField(upload_to='xls/')
	pub_date = models.DateTimeField('date published')
	
	def __unicode__(self):
		return self.title
