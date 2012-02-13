from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship, backref
from database import Base


class Definition(Base):
	__tablename__ = 'definitions'
	id = Column(Integer,primary_key=True)
	name = Column(String(50))
	text = Column(String(500))

	def __init__(self,name,text):
		self.text = text
		self.name = name

	def __repr__(self):
		return '<Definition %r>' % (self.name)