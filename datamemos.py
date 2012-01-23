from flask import Flask, render_template
from data_xls.views import data_api
from charts.views import charts_app
from memos.views import memos_app

import os

app = Flask(__name__)

app.register_blueprint(data_api,url_prefix='/data')
app.register_blueprint(memos_app,url_prefix='/memos')
app.register_blueprint(charts_app,url_prefix='/charts')