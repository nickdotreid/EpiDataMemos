from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship, backref
from database import Base

memo_to_tag = Table('memo_to_tag',Base.metadata,
	Column('memos_id',Integer,ForeignKey('memos.id')),
	Column('tags_id',Integer,ForeignKey('tags.id')))

class Memo(Base):
	__tablename__ = 'memos'
	id = Column(Integer, primary_key=True)
	key = Column(String(12))
	graph = Column(String(50))
	message = Column(String(500))
	author = Column(String(120))
	weight = Column(Integer)
	public = Column(Integer)
	
	tags = relationship("Tag",
		secondary=memo_to_tag,
		backref="memos")

	def __init__(self, graph, message, author):
		self.graph = graph
		self.message = message
		self.author = author
		self.weight = 5

	def __repr__(self):
		return '<Memo %r>' % (self.id)
		
class Tag(Base):
	__tablename__ = 'tags'
	id = Column(Integer,primary_key=True)
	text = Column(String(50))
	
	def __init__(self,text):
		self.text = text
	
	def __repr__(self):
		return '<Tag %r>' % (self.text)