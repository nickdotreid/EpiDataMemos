from sqlalchemy import Column, Integer, String
from database import Base

class Memo(Base):
	__tablename__ = 'memos'
	id = Column(Integer, primary_key=True)
	key = Column(String(12))
	graph = Column(String(50))
	message = Column(String(500))
	author = Column(String(120))
	weight = Column(Integer)
	public = Column(Integer)

	def __init__(self, graph, message, author):
		self.graph = graph
		self.message = message
		self.author = author
		self.weight = 5

	def __repr__(self):
		return '<Test %r>' % (self.id)