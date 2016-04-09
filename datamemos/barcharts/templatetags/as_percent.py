from django import template

register = template.Library()

def as_percent(value):
	return "{:.2%}".format(value) if isinstance(value, float) else "" 

register.filter('as_percent', as_percent)
