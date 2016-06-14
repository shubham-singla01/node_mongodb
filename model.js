//Change database name in url variable.
//Change upload directory in uploadDirectory variable.
var express = require('express'),
	bodyParser = require("body-parser"),
	multer = require('multer'),
	http = require('http'),	
	async = require('async'),	
	mongodb = require('mongodb'),
	fs = require('fs'),	
	catch_url='/flyttaapi/getinfo/',
	MongoClient = mongodb.MongoClient,
	url = 'mongodb://localhost:27017/testdata',
	_db,
	obj,		//objects as single string from json file
	aObjs =[],	//array of parsed objects from json file
	uploadDirectory='./uploads',	//directory location to store uploaded file
	savedfilename = '',		//variable to hold name of uploaded file	
	app = express();
	start_model();

//Connect to Database
function connect(){	
	MongoClient.connect(url, function(err, db) {
   if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
   } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);
	  _db=db;
	}
	});	
}

//Start server on port 3000
function start_model(){
	//Asynchronously connect to database and starts server on port 3000
	connect();
	server = http.createServer(app);
	//Started server on port 3000
	server.listen(3000, '127.0.0.1');
	server.on('listening', function() {
	 console.log('Express server started on port %s at %s', server.address().port, server.address().address);
	});	
	app.post(catch_url, function(req, res) {		
		upload_file(req,res);
	});
}

//uploads file into memory
function upload_file(req,res){
	//setting multer parameters for file storage
	var storage = multer.diskStorage({
		destination: function(req, file, callback) {
			callback(null, uploadDirectory);
		},
		filename: function(req, file, callback) {
			savedfilename = file.fieldname + '-' + Date.now();
			console.log('filename is %s', savedfilename);
			callback(null, savedfilename);
		}
	});
	
	//set multer to accept maximum 2 files
	var upload = multer({
		storage: storage
	}).array('files', 2);

	upload(req, res, function(err) {
		if (err) {return res.end("Error uploading file.");}	
		res.end("File is uploaded");		//file uploaded and saved to filepath	
		//reading file using synchronous file read method.
		var operations = [];
		operations.push(parsingFile);
		operations.push(addIntoDatabase);
		operations.push(deleteFile);
		async.series(operations, function(err, results) {});
	});
}
					
//Parse the content of file into individual collections
function parsingFile(callback) {
	var filePath = uploadDirectory +'/';
	filePath += savedfilename;
	obj = String(fs.readFileSync(filePath));
	console.log('Read From file complete');
	//striping first '{' and last '}'
	var size = obj.length - 1,
		start = 0,
		sTemp = ""; 	//used as temporary variable to hold string

	for (var i = 1; i < size - 1; i++) {
		if (obj[i] == "{")
			start = 1;
		if (start == 1)
			sTemp += obj[i];
		if (obj[i] == "}") {
			try{
			aObjs.push(JSON.parse(sTemp));
			}
			catch(e){return res.end("file is not valid JSON file");}
			sTemp = "";
			start = 0;
		}

	}
	callback(null, "Parsing into collections completed");
}
				
				
function addIntoDatabase(callback) {
	var collection = _db.collection('users');
	aObjs.forEach(function(objs) {
		collection.insert(objs, function(err, result) {
			if (err) {	console.log(err);
			} else {
				console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
			}
		});
	});
	callback(null, "Adding collections into database completed");
}

//deleting uploaded file				
function deleteFile(){	
	var filePath = uploadDirectory +'/';
	filePath += savedfilename;
	fs.unlink(filePath, (err) => {
		if (err) throw err;
		console.log('File Successfully Deleted ');
	});
}