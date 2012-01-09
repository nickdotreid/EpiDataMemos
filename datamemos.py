from flask import Flask
from memos.views import memos_app

app = Flask(__name__)
app.register_blueprint(memos_app)