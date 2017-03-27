/*
PROPS TO:
https://scotch.io/tutorials/easy-node-authentication-setup-and-local
and
https://github.com/brianc/node-postgres/wiki/Parameterized-queries-and-Prepared-Statements
*/


var app = require('express')();
var bodyParser = require('body-parser');
var pg = require('pg');
 


//use the `bodyParser()` middleware in app
//this way response.body will work to get form inputs easy
app.use(bodyParser());

//Express initializes app to be a function handler that you can supply to an HTTP server
var http = require('http').createServer(app);
var io = require('socket.io')(http)


//required for serving locally when testing
var serveStatic = require('serve-static');
app.use(serveStatic(__dirname + '/v1/'));
app.use(serveStatic(__dirname + '/socket.io/'));
//app.use(express.static('/v1')) //--Express tool for local serving


//listen for connections
//http.listen(port, ip,function(){  //on an IP
var port = process.env.PORT || 5000; 
http.listen(port,function(){ // Local Host
	console.log('*************************************************');
	console.log('listening on port: '+port);
	console.log('serving files from root: '+__dirname);
	console.log('*************************************************');
	});	
	
	
//envData accesses sensitive data like passwords which are saved outside of git repo
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

//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle
var ConnectionPool = new pg.Pool(connectionString);

 
//ADD A ROW --SAFE
/*
ConnectionPool.connect(function (err,client,done) {
	console.log('insert')
	client.query("INSERT INTO logintest(email,password) VALUES($1,$2)",["bob@gmail.com","pass123*"]);
});
*/


/*
app.post('/login', (request, response, next) => {
 
  // Get a Postgres client from the connection pool
  ConnectionPool.connect(function(err, client, done) {
  	
    // Handle connection errors
    if(err) {
      console.log(err);
      return response.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    client.query('SELECT email FROM logintest WHERE email = $1',[request.body.username], function (err, result) {
    	
    	//console.log(result); //this is what you have avail after the query
    	if (result.rowCount === 1) {
    		//email exists in DB, send to protected /login.html
    		 response.sendFile(__dirname+'/login.html')}
    	else {
    		//email NOT in DB
    		response.sendFile(__dirname+'/home.html')}
    });
    	
 	//call `done()` to release the client back to the pool
    done();

  });
});
*/


io.on('connection', function(socket){
	
	
	socket.on('disconnect', function(){
		console.log(this.id);
	});
	
	socket.on('ingredientSelectOptions',function(){
		console.log(this.id);
		io.to(socket.id).emit('SelectOptions',{'veggie':'broccoli'});
	});
	
	
	
});
 
//serve HTML to initial get request
app.get('/', function(request, response){
	response.sendFile(__dirname+'/dbAPI.html');
});

