import xlrd

def parse_data_file(_file_contents):
	wb = xlrd.open_workbook(file_contents=_file_contents)
	sh = wb.sheet_by_index(0)
	
	columns = {}
	column_keys = []
	for rownum in range(sh.nrows):
		row = sh.row_values(rownum)
		if rownum == 0:
			for index,item in enumerate(row):
				if index>0:
					if type(item) is float:
						item = str(int(item))
					column_keys.append(item)
		if rownum > 0:
			keys = []
			for index,value in enumerate(row):
				if type(value) is float:
					value = int(value)
					if column_keys[index-1] not in columns:
						columns[column_keys[index-1]] = {}
					fake_keys = keys[:]
					fake_keys.reverse()
					columns[column_keys[index-1]] = add_keys_to_obj(columns[column_keys[index-1]],fake_keys,value)
				else:
					if value is not '':
						keys.append(value)
	return columns
	
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