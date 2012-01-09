from flask import Blueprint, render_template, jsonify, abort
import os

charts_app = Blueprint('sharts_app', __name__)

charts_dir = os.environ['SFHIV_DATAMEMOS_CHARTS_DIR']

@charts_app.route('/')
def index():
	return 'i am a page'

@charts_app.route('/read/<chart>')
def get_chart(chart):
	filename = charts_dir+chart
	if not os.path.exists(filename):
		return 'no file'
	return filename
	