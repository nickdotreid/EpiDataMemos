from flask import Blueprint, render_template, jsonify, abort, redirect
import os, csv, xlrd, glob

charts_app = Blueprint('charts_app', __name__, static_folder='static', template_folder='templates')

charts_dir = os.environ['SFHIV_DATAMEMOS_CHARTS_DIR']

@charts_app.route('/json/<chart>')
def get_chart(chart):
	filename = charts_dir+chart
	if not os.path.exists(filename):
		return jsonify({})
	return jsonify(parse_data_file(filename))
	
def parse_data_file(file_location):
	data = {}
	wb = xlrd.open_workbook(file_location)
	sh = wb.sheet_by_index(0)
	keys = []
	raw_keys = sh.row_values(0)
	for num in range(len(raw_keys)-1):
		value = raw_keys[num+1]
		if type(value) is float:
			value = int(value)
		keys.append(str(value))
	for key in keys:
		data[key] = {}
	for rownum in range(sh.nrows-1):
		row = sh.row_values(rownum+1)
		for cellnum in range(len(row)-1):
			value = row[cellnum+1]
			if type(value) is float:
				value = int(value)
			data[keys[cellnum]][row[0]] = value
	return data
	
@charts_app.route('/')
def home_page():
	charts = []
	for xls in glob.glob(os.path.join(charts_dir,'*.xls')):
		charts.append(xls.replace(charts_dir,''))
	return render_template("index.html",charts=charts,title="Charts")
	 
@charts_app.route('/<chart>')
def show_page(chart):
	filename = charts_dir+chart
	if not os.path.exists(filename):
		return redirect("/")
	return render_template('chart.html',filename=chart,title=chart)