import os

os.environ['SFHIV_DATAMEMOS_CHARTS_DIR'] = 'data/'
os.environ['SFHIV_DATAMEMOS_DATABASE_URI'] = 'sqlite:////Users/nickreid/Documents/sfhiv/DataMemos/website/database.db'

from datamemos import app
app.run(host='0.0.0.0',debug=True)