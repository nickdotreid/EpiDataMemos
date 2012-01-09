from flask import Blueprint, render_template, jsonify, abort
import os, csv, xlrd

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
	data = parse_data_file(filename)
	return jsonify({'data':data})
	
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