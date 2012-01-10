import xlrd

def parse_data_file(file_location):
	data = {}
	wb = xlrd.open_workbook(file_location)
	sh = wb.sheet_by_index(0)	
	
	groups = []
	for num in range(sh.nrows):
		row = sh.row_values(num)
		if row[0] not in groups and num is not 0:
			groups.append(row[0])
	
	columns = {}
	for rownum in range(sh.nrows):
		row = sh.row_values(rownum)
		for cellnum in range(len(row)):
			if cellnum>0:
				value = row[cellnum]
				if type(value) is float:
					value = int(value)
				if cellnum not in columns:
					columns[cellnum] = {}
				if rownum > 0:
					columns[cellnum][row[0]] = value
				else:
					columns[cellnum]['Label'] = value
	list_column = []
	for col in columns:
		list_column.append(columns[col])
	data['columns'] = list_column
	data['filters'] = groups
	return data