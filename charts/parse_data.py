import xlrd

def parse_data_file(file_location):
	data = {}
	wb = xlrd.open_workbook(file_location)
	sh = wb.sheet_by_index(0)
	keys = []
	raw_keys = sh.row_values(0)
	for num in range(len(raw_keys)-1):
		value = raw_keys[num+1]
		if type(value) is float:
			value = int(value)
		keys.append(str(value))
	for key in keys:
		data[key] = {}
	for rownum in range(sh.nrows-1):
		row = sh.row_values(rownum+1)
		for cellnum in range(len(row)-1):
			value = row[cellnum+1]
			if type(value) is float:
				value = int(value)
			data[keys[cellnum]][row[0]] = value
	return data