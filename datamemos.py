from flask import Flask
from charts.views import charts_app
from memos.views import memos_app

app = Flask(__name__)
app.register_blueprint(charts_app)
app.register_blueprint(memos_app,url_prefix='/memos')