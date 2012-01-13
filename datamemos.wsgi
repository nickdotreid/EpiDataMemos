import os,sys
os.environ['SFHIV_DATAMEMOS_SETTINGS'] = '/path/to/settings.py'
os.environ['SFHIV_DATAMEMOS_CHARTS_DIR'] = '/path/to/charts/'
os.environ['SFHIV_DATAMEMOS_DATABASE_URI'] = '/path/to/database.db'

sys.path.insert(0,"/path/to/DATAMEMOS")
from datamemos import app as application