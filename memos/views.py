from flask import Blueprint, render_template, jsonify, request, redirect, abort, url_for

from database import db_session
from models import *

memos_app = Blueprint('memos_app', __name__, static_folder='static', template_folder='templates')

@memos_app.route('/',methods=['GET', 'POST'])
def get_memos():
	memos = []
	for memo in Memo.query.all():
		memos.append(render_template("memo/view.html",memo=memo))
	return format_response(render_template("memo/list.html",memos=memos))

@memos_app.route('/create',methods=['GET', 'POST'])
def create():
	if request.method == "POST" and 'message' in request.form:
		memo = save_memo()
		if memo:
			return format_response(render_template("memo/view.html",memo=memo))
	return format_response(render_template("memo/form.html",memo=request.form))

@memos_app.route('/<key>',methods=['GET', 'POST'])
def read(key):
	memo = Memo.query.filter_by(key=key).first()
	if memo is None:
		abort(404)
	return format_response(render_template("memo/view.html",memo=memo))

@memos_app.route('/<key>/update',methods=['GET', 'POST'])
def update(key):
	memo = Memo.query.filter_by(key=key).first()
	if memo is None:
		abort(404)
	if request.method == "POST" and 'message' in request.form:
		memo = save_memo(memo.key)
		if memo:
			return format_response(render_template("memo/view.html",memo=memo))
		return format_response(render_template("memo/form.html",memo=request.form))
	return format_response(render_template("memo/form.html",memo=memo))
	
@memos_app.route('/<key>/delete',methods=['GET', 'POST'])
def delete(key):
	memo = Memo.query.filter_by(key=key).first()
	if memo is None:
		abort(404)
	db_session.delete(memo)
	db_session.commit()
	return format_response("deleted")
	
def save_memo(key=None):
	memo = Memo.query.filter_by(key=key).first()
	if key is None or memo is None:
		memo = Memo(request.form['message'],request.form['author'])
		db_session.add(memo)
	if 'public' in request.form:
		memo.public=True
	else:
		memo.public=False
	if 'graph' in request.form and 'graph' is not '':
		tag = get_tag(request.form['graph'],'graph')
		if memo not in tag.memos:
			tag.memos.append(memo)
	if 'filter' in request.form and 'filter' is not '':
		tag = get_tag(request.form['filter'],'filter')
		if memo not in tag.memos:
			tag.memos.append(memo)
	db_session.commit()
	return memo

def get_tag(text,typer):
	tag = Tag.query.filter_by(text=text).filter_by(type=typer).first()
	if tag is None:
		tag = Tag(text,typer)
		db_session.add(tag)
		db_session.commit()
	return tag

def format_response(response):
	if request.method == "POST" and 'ajax' in request.form:
		return jsonify({'content':response})
	return render_template("page.html",content=response)