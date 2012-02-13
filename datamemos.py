from flask import Flask, render_template
from data_xls.views import data_api
from charts.views import charts_app
from memos.views import memos_app
from definitions.views import definitions_app

from data_xls.views import list_all_charts

import os

app = Flask(__name__)

app.register_blueprint(data_api,url_prefix='/data')
app.register_blueprint(memos_app,url_prefix='/memos')
app.register_blueprint(charts_app,url_prefix='/charts')
app.register_blueprint(definitions_app,url_prefix='/definitions')

@app.route('/')
def list_graphs():
	charts = list_all_charts()
	return render_template("charts.html",charts=charts)