from flask import Blueprint, render_template, jsonify, abort, redirect
import os, csv, xlrd, glob

charts_app = Blueprint('charts_app', __name__, static_folder='static', template_folder='templates')

charts_dir = os.environ['SFHIV_DATAMEMOS_CHARTS_DIR']

@charts_app.route('/<chart>')
def view(chart):
	filename = charts_dir+chart
	if not os.path.exists(filename):
		return render_template('index.html')
	title = chart.replace("_"," ").replace(".xls","")
	return render_template('chart.html',filename=chart,title=title)