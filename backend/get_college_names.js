const fs = require('fs');

module.exports = async function()
{
	return new Promise(function(resolve, reject)
	{
		fs.readFile('../datasets/colleges.txt', 'utf8', function(err, contents)
		{
			if (err)
			{
				console.log(err);
				reject();
			}
			else
			{
				resolve(contents.split(/(\\r\\n|\\r|\\n)/).filter((str, i) => {return i % 2 == 0}));
			}
		});
	});
}
