import xlrd

def parse_data_file(file_location):
	data = {}
	wb = xlrd.open_workbook(file_location)
	sh = wb.sheet_by_index(0)
	
	columns = {}
	for rownum in range(sh.nrows):
		if rownum > 0:
			row = sh.row_values(rownum)
			colnum = 0
			keys = []
			for cellnum in range(len(row)):
				value = row[cellnum]
				if type(value) is float:
					value = int(value)
					if colnum not in columns:
						columns[colnum] = {}
					fake_keys = keys[:]
					fake_keys.reverse()
					columns[colnum] = add_keys_to_obj(columns[colnum],fake_keys,value)
					colnum += 1
				else:
					if value is not '':
						keys.append(value)
	if sh.nrows > 1:
		row = sh.row_values(0)
		name = False
		colnum = 0
		for cellnum in range(len(row)):
			value = row[cellnum]
			if value is not '':
				if type(value) is float:
					value = str(int(value))
				if not name:
					name = value
				else:
					columns[colnum][name] = value
					columns[colnum]['Label'] = value
	list_column = []
	for col in columns:
		list_column.append(columns[col])
	data['columns'] = list_column
	return data
	
def add_keys_to_obj(obj,keys,value):
	if keys is None or len(keys)<1:
		return obj
	key = keys.pop()
	if key not in obj:
		obj[key] = {}
	if len(keys)>0:
		obj[key] = add_keys_to_obj(obj[key],keys,value)
	else:
		obj[key] = value
	return obj