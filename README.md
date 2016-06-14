# node_mongodb
Code to upload json file to mongodb database using node
How to run:
1. Run npm install , to install required dependencies
2. Run node model.js , to start server listening on port 3000
3. Open test_view.html in browser and select valid JSON file.
4. Click on Submit.
Check database.(default daatabase is testdata and users collection, It can be changed in model.js)

Caution:
1. Make sure directory uploads is available in project directory. All the uploaded files are temporary copied there.
2. Assuming input JSON file to be in standard format (Given users.json is in this format.)
Format : (starting and ending braces necessary)
{
	{"a":"1",
	 "b":"2",
	}
	{"a":"3",
	 "b":"2",
	}
}
3. While testing through other upload ways , enctype of post request must be multipart/form-data for this to work.
4. Maximum of 2 files can be selected at once.
