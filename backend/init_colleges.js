const mongoose = require('mongoose');
const college = require('../models').College;

const request = require("request");

const getCollegeNames = require("./get_college_names.js");

mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });


module.exports = function()
{
	return new Promise (function(resolve, reject)
	{
		college.find(async function(err, collegeArr)
		{
			if (err)
			{
				console.log("error with the database (init_colleges.js)");
				reject();
			}
			else
			{
				if (collegeArr.length != 0)
				{
					console.log("colleges have already been initialized");
					reject();
				}
				else
				{
					let collegeNames = await getCollegeNames();
					for (let i = 0; i < collegeNames.length; i ++)
					{
						await new Promise(function(resolve, reject)
						{
							college.create({name : collegeNames[i]}, function (err)
							{
								if (err)
								{
									console.log("error with the database (init_colleges.js)");
								}
								else
								{
									console.log("created college: " + collegeNames[i]);
								}
								resolve();
							});
						});
					}
					resolve();
				}
			}
		});
	});
}

module.exports();