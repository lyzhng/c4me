import re
import json

import requests

from bs4 import BeautifulSoup

remapped_names = {
	'Franklin and Marshall College': 'Franklin Marshall College',
	'SUNY College of Environmental Science and Forestry': 'State University of New York College of Environmental Science and Forestry',
	'The College of Saint Scholastica': 'College of St. Scholastica',	
}

all_data = []
dictionary = {}
with open('colleges.txt') as f:
	lines = f.readlines()
	for line in lines:
		query_college_name = saved_college_name = line.rstrip()
		query_college_name = remapped_names[saved_college_name] if saved_college_name in remapped_names else query_college_name
		query_college_name = re.sub(r'(\bThe\s)|\.', '', query_college_name)
		query_college_name = re.sub(r'(\s\&\s)|\,\s|\s', '-', query_college_name)
		url = f'https://www.collegedata.com/college/{query_college_name}'
		res = requests.get(url)
		if res.status_code != 200:
			print(f'Status code is not OK for {saved_college_name} under {query_college_name}!')
		else:
			dictionary = {}
			dictionary['College Name'] = saved_college_name
			soup = BeautifulSoup(res.text, 'html.parser')
			profile_overview = soup.find(id='profile-overview')
			if not profile_overview:
				print(f'{saved_college_name} could not be parsed under {query_college_name}!')
				continue
			dl_tags = profile_overview.findChildren(name='dl', attrs={ 'class': 'dl-split-sm' }, recursive=True)
			for dl_tag in dl_tags:
				dt_tags = dl_tag.findChildren(name='dt', recursive=False)
				dd_tags = dl_tag.findChildren(name='dd', recursive=False)
				assert len(dt_tags) == len(dd_tags), 'The lengths of dt_tags and dd_tags are not the same. Data is missing.'
				for dt_tag, dd_tag in zip(dt_tags, dd_tags):
					dictionary[dt_tag.text] = dd_tag.text
			all_data.append(dictionary)

print(json.dumps(all_data, indent=4))
