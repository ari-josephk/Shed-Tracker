import csv
import requests
import datetime

CSV_URL = 'https://nycdob.github.io/ActiveShedPermits/data/Active_Sheds2.csv'

with requests.Session() as s:
	download = s.get(CSV_URL)
	decoded_content = download.content.decode('utf-8')

	data = list(csv.reader(decoded_content.splitlines(), delimiter=','))

	headers = data[0]

	header_map = {}
	for header_name in ['Age', 'Sidewalk Shed/Linear Feet', 'Borough Name']:
		header_map[header_name] = headers.index(header_name)

	total_count = len(data) - 1
	total_count_borough = {}
	avg_age = 0
	total_feet = 0

	for shed in data[1:]:
		avg_age += float(shed[header_map['Age']]) / total_count
		borough = shed[header_map['Borough Name']].lower()

		if borough in total_count_borough:
			total_count_borough[borough] += 1
		else:
			total_count_borough[borough] = 1

		total_feet += float(shed[header_map['Sidewalk Shed/Linear Feet']])

try:
	r = csv.reader(open("results.csv", "r"), delimiter=',')
	lines = list(r)
	num_lines = len(lines)
	last_line = lines[num_lines - 1]
	
except (FileNotFoundError):
	num_lines = 0
	last_line = None

w = csv.writer(open("results.csv", "a", newline=''))

current_date = str(datetime.date.today())

result_headers = ['Date', 'Total Count', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island', 'Average Age', 'Total Feet']
result = [current_date, total_count, total_count_borough['manhattan'], total_count_borough['brooklyn'], total_count_borough['queens'], total_count_borough['bronx'], total_count_borough['staten island'], avg_age, total_feet]

if last_line and last_line[0] == current_date:
	print(last_line)
else:
	print(num_lines)
	if num_lines == 0:
		w.writerow(result_headers)
	w.writerow(result)