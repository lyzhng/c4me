const fs = require('fs');

module.exports = function(filepath)
{
	if (!filepath)
	{
		filepath = "../datasets/colleges.txt";
	}
	return new Promise(function(resolve, reject)
	{
		fs.readFile(filepath, 'utf8', function(err, contents)
		{
			if (err)
			{
				console.log(err);
				reject();
			}
			else
			{
				resolve(contents.split(/(\r\n|\r|\n)/).filter((str, i) => {return i % 2 == 0}));
			}
		});
	});
}

//returns array of college names
// [ 'American University',
//   'Barnard College',
//   'Berry College',
//   'California State University, East Bay',
//   'California State University, Fresno',
//   'California State University, Monterey Bay',
//   'Campbell University',
//   'Carnegie Mellon University',
//   'Central Connecticut State University',
//   'Centre College',
//   'Clarkson University',
//   'Colgate University',
//   'Colorado College',
//   'DePaul University',
//   'DePauw University',
//   'Drake University',
//   'Drexel University',
//   'Eastern Illinois University',
//   'Eastern Washington University',
//   'Florida Gulf Coast University',
//   'Fordham University'...
//   ]
