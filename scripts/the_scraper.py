import re
import requests
import json

from bs4 import BeautifulSoup

headers = { 'User-Agent': 'I am hooman' }
all_data = []
count = 0

with open('colleges.txt') as f:
	lines = f.readlines()
	for line in lines:
		query_college_name = saved_college_name = line.rstrip()
		query_college_name = re.sub(r'(\bThe\s)|\sthe|\.', '', query_college_name)
		query_college_name = re.sub(r'(\s\&\s)|\,\s|(\sof\s)|(\sat\s)|\s', '-', query_college_name)
		url = f'https://www.timeshighereducation.com/world-university-rankings/{query_college_name}'
		res = requests.get(url, headers=headers)
		if res.status_code != 200:
			print(f'Status code is {res.status_code} for {saved_college_name} under {query_college_name}!')
			continue
		dictionary = {}
		dictionary['College Name'] = saved_college_name
		soup = BeautifulSoup(res.text, 'html.parser')
		pane_contents = soup.find_all('div', attrs={ 'class': 'pane-content' })
		if not pane_contents:
			print(f'{saved_college_name} was not accounted for.')
			continue
		for pane_content in pane_contents:
			values = pane_content.findChildren(name='div', attrs={ 'class': 'value' }, recursive=True)
			keystats = pane_content.findChildren(name='div', attrs={ 'class': 'keystats' }, recursive=True)
			if values and keystats: # same university
				assert len(values) == len(keystats), 'Values and keystats do not have the same length. Data is missing.'
				for keystat, value in zip(keystats, values):
					dictionary[keystat.text] = value.text
				all_data.append(dictionary)
				count += 1
				# print(count, saved_college_name)
			

print(json.dumps(all_data, indent=4))