from flask import request, redirect, abort, url_for

from database import db_session
from models import *

def save_memo(key=None):
	memo = Memo.query.filter_by(key=key).first()
	if key is None or memo is None:
		memo = Memo(request.form['message'],request.form['author'])
		db_session.add(memo)
	else:
		memo.message = request.form['message']
		memo.author = request.form['author']
	if 'weight' in request.form:
		memo.weight = int(request.form['weight'])
	if 'public' in request.form:
		memo.public=True
	else:
		memo.public=False
	tag_keys = ['graph','filter','highlight']
	for key in tag_keys:
		if key in request.form and request.form[key] is not '':
			tag = get_tag(request.form[key],key)
			if memo not in tag.memos:
				tag.memos.append(memo)
	db_session.commit()
	return memo