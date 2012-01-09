from flask import Flask
from memos import memos_app

app = Flask(__name__)
app.register_blueprint(memos_app)