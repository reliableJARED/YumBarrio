/*
GOOD START POINT:
https://code.tutsplus.com/tutorials/authenticating-nodejs-applications-with-passport--cms-21619
and
http://stackoverflow.com/questions/38136792/typeerror-req-flash-is-not-a-function
and
http://mherman.org/blog/2016/09/25/node-passport-and-postgres/#.WH7CxT_L9z0

*/

var pg = require('pg');

//access yumbarrio db on heroko
//https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku
//http://stackoverflow.com/questions/25000183/node-js-postgresql-error-no-pg-hba-conf-entry-for-host

//GET REQUEST STRING INFO:
/*
heroku pg:credentials YUMBARRIO_DB_URL

!!!IMPORTANT!!!!
use heroku CLI to set user name and pw
heroku config:set DB_USER=MyUserNameHere DB_PASS=MyPasswordHere DB_NAME=dbnameHere

https://devcenter.heroku.com/articles/heroku-local#copy-heroku-config-vars-to-your-local-env-file
 //--then access with process.env.DB_USER and process.env.DB_PASS
 NOTE! the .env file should NEVER be posted to github
*/


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

var client = new pg.Client({
    user: environment.DB_USER,
    password: environment.DB_PASS,
    database: environment.DB_NAME,
    port: 5432,
    host: environment.DB_HOST,
    ssl: true
});

//CONNECT TO THE DB
client.connect();

//rowCount will hold a SQL query result
var rowCount;

var randString = Math.random().toString(36).substring(2,7);
/*
//COUNT HOW MANY ROWS WE HAVE, THEN ADD NEW
const query1 = client.query(
	//FIRST QUERY
  "SELECT COUNT(*) FROM mytabletest", function (err,result) {
  		
  		//Results of FIRST QUERY
		console.log(result.rows[0].count); 
		rowCount = result.rows[0].count+1;
		
		//SECOND QUERY USING FIRST QUERY RESULTS
		client.query("INSERT INTO mytabletest VALUES($1,$2)",[rowCount,randString],() =>
		 { //DISCONNECT AFTER SECOND QUERY
		 	client.end();});	
  });
 */
 //OTHER EXAMPLES:
 
//MAKE A TABLE
const query = client.query(
  'CREATE TABLE facebook (id SERIAL PRIMARY KEY, text VARCHAR(40) not null)');
query.on('end', () => { client.end(); });


 /*
//ADD A ROW --SAFE
const query = client.query(
  "INSERT INTO mytabletest VALUES($1,$2)",[8,"tom"]);
 query.on('end', () => { client.end(); });

*/

