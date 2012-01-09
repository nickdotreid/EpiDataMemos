from flask import Flask, render_template
from charts.views import charts_app
from memos.views import memos_app

import os

app = Flask(__name__)

charts_dir = os.environ['SFHIV_DATAMEMOS_CHARTS_DIR']

app.register_blueprint(memos_app,url_prefix='/memos')
app.register_blueprint(charts_app,url_prefix='/charts')