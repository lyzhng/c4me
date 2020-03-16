import requests
from time import sleep
from random import uniform

headers = {
	'Host':'www.niche.com',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cookie': '_pxhd=b03406b8705b7f8353ccba6e98571777c6f328d316bfaf6f533f0682adde7bb3:4cc57971-6648-11ea-8e32-4bc99936e254; xid=dabb0501-8a9d-4bd3-ac3b-f95e850e490e; navigation=%7B%22location%22%3A%7B%22guid%22%3A%229b68e2cd-0da9-4ec6-ac31-33e2d89920aa%22%2C%22type%22%3A%22MetroArea%22%2C%22name%22%3A%22New%20York%20City%20Area%22%2C%22url%22%3A%22new-york-city-metro-area%22%7D%2C%22navigationMode%22%3A%22full%22%2C%22vertical%22%3A%22k12%22%2C%22mostRecentVertical%22%3A%22k12%22%2C%22suffixes%22%3A%7B%22colleges%22%3A%22%2Fm%2Fnew-york-city-metro-area%2F%22%2C%22graduate-schools%22%3A%22%2Fm%2Fnew-york-city-metro-area%2F%22%2C%22k12%22%3A%22%2Fm%2Fnew-york-city-metro-area%2F%22%2C%22places-to-live%22%3A%22%2Fm%2Fnew-york-city-metro-area%2F%22%2C%22places-to-work%22%3A%22%2Fm%2Fnew-york-city-metro-area%2F%22%7D%7D; experiments=mini_expansion_header%7Cvariation1%5E%5E%5E%240%7C1%5D; _gcl_au=1.1.1273538567.1584227130; niche_sessionPageCount=30; niche_npsSurvey=0; niche_fullStory=0; niche_singleFirstPageview=1; _ga=GA1.2.1996521713.1584227130; _gid=GA1.2.484543382.1584227130; _fbp=fb.1.1584227130694.666677108; _cmpQcif3pcsupported=1; _scid=38a247e1-2e5a-4858-9a44-2910b5661ce8; _pxvid=4cc57971-6648-11ea-8e32-4bc99936e254; _sctr=1|1584158400000; niche_singleProfilePageview=1; niche_singleK12Pageview=1; recentlyViewed=entityHistory%7CentityName%7CWard%2BMelville%2BSenior%2BHigh%2BSchool%7CentityGuid%7C9af0c700-e15a-46ff-a07d-2ddab41b1db2%7CentityType%7CSchool%7CentityFragment%7Cward-melville-senior-high-school-east-setauket-ny%7CCentral%2BHigh%2BSchool%7C88d1fd1f-bafd-4257-9d52-ec3ec7e0c298%7Ccentral-high-school-park-hills-mo%7CStratford%2BHigh%2BSchool%7C4a2b0a34-a0e3-4add-90ce-92c5f610d200%7Cstratford-high-school-stratford-tx%7CCobalt%2BInstitute%2Bof%2BMath%2B%26%2BScience%7C72cf8eaa-7e3c-4f05-82bc-cf11d26b56c5%7Ccobalt-institute-of-math--and--science-victorville-ca%7CsearchHistory%7CNew%2BYork%2BCity%2BArea%7C9b68e2cd-0da9-4ec6-ac31-33e2d89920aa%7CMetroArea%7Cnew-york-city-metro-area%7CSt.%2BFrancois%2BCounty%7C14b82916-cfce-4bae-a87e-d5610ef2f8a6%7CCounty%7Cst-francois-county-mo%7CSherman%2BCounty%7C76b68cf8-bdb9-4b94-b60e-fa58e70359f1%7Csherman-county-tx%5E%5E%5E%240%7C%40%241%7C2%7C3%7C4%7C5%7C6%7C7%7C8%5D%7C%241%7C9%7C3%7CA%7C5%7C6%7C7%7CB%5D%7C%241%7CC%7C3%7CD%7C5%7C6%7C7%7CE%5D%7C%241%7CF%7C3%7CG%7C5%7C6%7C7%7CH%5D%5D%7CI%7C%40%241%7CJ%7C3%7CK%7C5%7CL%7C7%7CM%5D%7C%241%7CN%7C3%7CO%7C5%7CP%7C7%7CQ%5D%7C%241%7CR%7C3%7CS%7C5%7CP%7C7%7CT%5D%5D%5D; profileModalPromptShown=true; __gads=ID=e5c3d5ccf60cad4a:T=1584227585:S=ALNI_MbKnoXV93C7y94k0nsVIk3Kb5UbKA; G_ENABLED_IDPS=google; hintSeenLately=true; _dc_gtm_UA-2431522-39=1; _pxff_wa=1; _px3=7a2a430ad49ac1f247d120aa30ce4cd3dc21221527cd8145913e0c15820f446b:0zrZkOGqHlG+9AJfVoUVD2547U0saKv5EAsPn9mSyYUocVLpoZXwtyOz+npPRDsFl7V0hpjhD6zYwlaNeUmnFg==:1000:fmTu79zqs4OqxfL6jFC4COlN9RHFXpPmZDaPk8zWvWzdwB1H+orsj8mjyC0QWGa08FF7tC6TS2yRjG7z47ouTk3qQmhbxwcYHFBB9n6lqAe3I0cZRyjdr4EYc5XnVgciNzDJAlO55sBGJ2Per/2v68uR52z8ISUK3fGTCV+yqtE=',
  'Upgrade-Insecure-Requests': '1',
  'If-None-Match': 'W/"31c43-FY5DwBTWHgxRSB18/ZtMTpRMVBA"',
  'Cache-Control': 'max-age=0',
  'TE': 'Trailers'
  }

count = 0
while True:
    res = requests.get('https://www.niche.com/k12/stuyvesant-high-school-new-york-ny/', headers=headers)
    if res.status_code != 200:
        print('Status is not OK')
        break
    else:
        count += 1
        print(res.status_code, count)
        sleep(4)