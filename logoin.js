/*
PROPS TO:
https://scotch.io/tutorials/easy-node-authentication-setup-and-local
*/


var pg = require('pg');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var app = require('express')();
var bodyParser = require('body-parser');

//use the `bodyParser()` middleware in app
app.use(bodyParser());

//Express initializes app to be a function handler that you can supply to an HTTP server
var http = require('http').createServer(app);
//required for serving locally when testing
var serveStatic = require('serve-static');
//app.use(express.static('directorypath')) --Express tool for local serving


//listen for connections
//http.listen(port, ip,function(){  //on an IP
var port = process.env.PORT || 5000; 
http.listen(port,function(){ // Local Host
	console.log('*************************************************');
	console.log('listening on port: '+port);
	console.log('serving files from root: '+__dirname);
	console.log('*************************************************');
	});	
	
function envData() {
	var envData;
	try {
		envData = require('../YumBarrio_local/env.json') 
	}catch (e) {
		envData = process.env }
	return envData;
};

//load config data.  This is sensitive info that is avial in heroku environment.  When testing locally, call from file outside git repo
const environment = envData();

const connectionString = {
   	 user: environment.DB_USER,
    	password: environment.DB_PASS,
    	database: environment.DB_NAME,
   	 port: 5432,
    	host: environment.DB_HOST,
    	ssl: true
	};

app.post('/login', (req, res, next) => {
  const results = [];
 
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT email FROM logintest WHERE email = $1',[req.body.username], function (err, result) {
    	
    	console.log(result.rows.length);
    })
    	/* THIS WORKS BELOW
    	// Stream results back one row at a time
   	 query.on('row', (row) => {
      	return res.sendFile(__dirname+'/login.html');
    	});*/
   
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      //return res.json(results);
    });
  });
});

 
 /*
//MAKE A TABLE
//http://dba.stackexchange.com/questions/68266/postgresql-datatype-for-email-address
 //DON'T use email as PK because The issue is that the email address cannot be changed afterwards, because it's both a primary key & referenced as foreign key
const query = client.query(
  'CREATE TABLE logintest (id SERIAL PRIMARY KEY,  email VARCHAR(256) not null,password VARCHAR(256) not null)');
  	
query.on('end', () => { client.end(); });
*/

 /*
//ADD A ROW --SAFE
const query = client.query(
  "INSERT INTO logintest VALUES(8,$1,$2)",["jarednugent@gmail.com","pass123*"]);
 query.on('end', () => { client.end(); });
*/

 
//serve HTML to initial get request
app.get('/', function(request, response){
	response.sendFile(__dirname+'/home.html');
});

 
//CREATE FILE: app/routes.js
//*****EXPORT BELOW
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    /*
app.get('/', function(request, response) {
        response.sendFile(__dirname+'/home.html');
    });

app.post('/login', function(request, response) {
		//	console.log(Object.keys(request));
			console.log('input:',request.body.username);
			findEmail({column:'email', data:request.body.username});
			//var result = findEmail({column:'email', data:request.body.username});
		//	console.log('result',result)
      //  if(result === request.body.username)response.sendFile(__dirname+'/login.html');
    });




function findEmail(find) {
	
	//Database Connection Config
	var DATABASE = new pg.Client({
   	 user: environment.DB_USER,
    	password: environment.DB_PASS,
    	database: environment.DB_NAME,
   	 port: 5432,
    	host: environment.DB_HOST,
    	ssl: true
	});

	//CONNECT TO THE DB
	DATABASE.connect();
	
	//wrap query in promise: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
	const Qresult = new Promise(
				function(resolve,reject){
					resolve(DATABASE.query("SELECT email FROM logintest WHERE email=$1", [find.data]));
					});
		//http://stackoverflow.com/questions/22078839/installing-passportjs-with-postgresql		
		//GOT WHAT WE WERE LOOKING FOR		
		Qresult.then( (success) => {
				console.log('found',success.rows[0].email)

				DATABASE.end();
     		   return success.rows[0].email;
      	})
      //SOMETHING WENT WRONG
      .catch( (err) => {
      		DATABASE.end();
     		   log.error("/login ERROR: " + err);
        		return 999;
     	 });
	return Qresult
};
*/

