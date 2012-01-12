from flask import Blueprint, render_template, jsonify, abort, redirect
import os, csv, xlrd, glob
from parse_data import *

charts_app = Blueprint('charts_app', __name__, static_folder='static', template_folder='templates')

charts_dir = os.environ['SFHIV_DATAMEMOS_CHARTS_DIR']

@charts_app.route('/json/<chart>')
def get_data(chart):
	filename = charts_dir+chart
	if not os.path.exists(filename):
		return jsonify({})
	return jsonify(parse_data_file(filename))
	
@charts_app.route('/')
def index():
	charts = []
	for xls in glob.glob(os.path.join(charts_dir,'*.xls')):
		charts.append(xls.replace(charts_dir,''))
	return render_template("index.html",charts=charts,title="Charts")
	 
@charts_app.route('/<chart>')
def view(chart):
	filename = charts_dir+chart
	if not os.path.exists(filename):
		return redirect("/")
	return render_template('chart.html',filename=chart)