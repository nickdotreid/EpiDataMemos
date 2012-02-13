from flask import Blueprint, render_template, jsonify, request, redirect, abort, url_for

from database import db_session
from models import *

definitions_app = Blueprint('definitions_app', __name__, static_folder='static', template_folder='templates')

@definitions_app.route('/',methods=['GET', 'POST'])
def view_all():
	definitions = Definition.query.all()
	return render_template("list.html",definitions=definitions)

@definitions_app.route('/create',methods=['GET', 'POST'])
def create_definition():
	if save_definition is not None:
		return redirect(url_for('definitions_app.view_all'))
	return render_template("form.html")

@definitions_app.route('/view/<id>',methods=['GET', 'POST'])
def view(id):
	definition = Definition.query.filter_by(id=id).first()
	if definition is None:
		return redirect(url_for('definitions_app.view_all'))
	render_template("view.html",definition=definition)
	
@definitions_app.route('/update/<id>',methods=['GET', 'POST'])
def update(id):
	definition = Definition.query.filter_by(id=id).first()
	if definition is None:
		return redirect(url_for('definitions_app.view_all'))
	render_template("form.html",definition=definition)

@definitions_app.route('/delete/<id>',methods=['GET', 'POST'])
def delete(id):
	definition = definition.query.filter_by(key=key).first()
	if definition is not None:
		db_session.delete(definition)
		db_session.commit()
	return redirect(url_for('definitions_app.view_all'))
	
def save_definition():
	definition = None
	if 'id' in request.form:
		definition = Definition.query.filter_by(id=request.form['id']).first()
	if definition is None:
		definition = Definition("","")
		db_session.add(definition)
	if 'name' in request.form:
		definition.name = request.form['name']
	if 'text' in request.form:
		definition.name = request.form['text']
	db_session.commit()
	return definition
