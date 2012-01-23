from flask import Blueprint, render_template, jsonify, abort, redirect
import os, glob
from parse_data import *

data_api = Blueprint('data_api', __name__, static_folder='static', template_folder='templates')

charts_dir = os.environ['SFHIV_DATAMEMOS_CHARTS_DIR']

@data_api.route('/')
def index():
	charts = []
	for xls in glob.glob(os.path.join(charts_dir,'*.xls')):
		charts.append(xls.replace(charts_dir,''))
	return jsonify(charts=charts)

@data_api.route('/<chart>')
def get_data(chart):
	filename = charts_dir+chart
	if not os.path.exists(filename):
		return jsonify({})
	return jsonify(parse_data_file(filename))