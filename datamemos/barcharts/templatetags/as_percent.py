from django import template

register = template.Library()

def as_percent(value):
	if not isinstance(value,float):
		return ""
	return "{0:.2f}%".format(value*100)

register.filter('as_percent', as_percent)