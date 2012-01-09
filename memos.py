from flask import Blueprint, render_template, jsonify

from database import db_session
from models import *

memos_app = Blueprint('memos_app', __name__)

@memos_app.route('/')
def get_memos():
	memos = []
	for memo in Memo.query.all():
		memos.append({
			'key':memo.key,
			'message':memo.message,
			'author':memo.author,
			'weight':memo.weight
		})
	return jsonify({'memos':memos})