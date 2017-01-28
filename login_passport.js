/*
PROPS TO:
https://scotch.io/tutorials/easy-node-authentication-setup-and-local
and
https://github.com/brianc/node-postgres/wiki/Parameterized-queries-and-Prepared-Statements
*/


var pg = require('pg');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

var app = require('express')();
var session = require('express-session');

var bodyParser = require('body-parser');
//use the `bodyParser()` middleware in app
//this way for requests we can do things like request.body to get form input data
//app.use(bodyParser());
app.use( bodyParser.urlencoded({ extended: true }) );


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

//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle
var client = new pg.Pool(connectionString);

 /*
//ADD A ROW --SAFE
const query = client.query(
  "INSERT INTO logintest VALUES(8,$1,$2)",["jarednugent@gmail.com","pass123*"]);
 query.on('end', () => { client.end(); });
*/

 
//serve HTML to initial get request
app.get('/', function(request, response){
	response.sendFile(__dirname+'/signup.html');
});


//****************************************************************
//		file:		USER.JS  
//****************************************************************
/*
//HEADERS when imported as file
var pg           = require('pg');
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
var client = new pg.Pool(connectionString);

function User(){
*/
var User = function() {    
	 this.database_id;//SQL assigned Primary Key, our database assigns this
    this.email;
    this.password;

    this.save = function(callback) {
       client.connect(function(err, client, done) {
			if(err){
             console.log(err);
             return {success: false, data: err};
           }
				//BEFORE we save, check that they don't already exist
				//TODO:
				//this.findbyEmail (wrap stuff below into this)
            client.query('SELECT email FROM logintest WHERE email = $1', [this.email], function (err, result){
                if(err){
                    console.log(err);
                    return {success: false, data: err};
                	}
                if (result.rowCount === 1) {
    					//email already exists in DB
    					console.log(' account exists for:',this.email);
    					return {success: false, data: "User Already Exists in Database"};
               	}
               if (result.rowCount === 0)  {
               	//create new account if email not found
               	client.query('INSERT INTO logintest(email, password) VALUES($1, $2)', [this.email, this.password], function (err, result) {
                		if(err){
                  	  	console.log(err);
                    		 return {success: false, data: err};
                			}
							//Select the new account so that we get our database assigned ID
							 client.query('SELECT email FROM logintest WHERE email = $1', [this.email], function (err, result){
							 		if(err){
                  	  			console.log(err);
                    		 		return {success: false, data: err};
                				}
							 			var user = new User();
                    				user.email= this.email;
                    				user.password = this.password;
                    				user.database_id = result.rows[0]['id'];
                    				console.log('new account for:',user.email);
                    				done();
                    				return callback(user);
							 });
               	});
            	}
           });
   	 });
   };
}

User.findByEmail = function(email, callback){
	
	 // callback has 3 args we need to return:
        // arg 1: err: false if there is no error
        // arg 2: isAvailable: whether the email is available or not
        // arg 3: this: the User object or null
        
    var isAvailable = false; //change to true if email NOT found in db
   
    console.log('looking for email in User.findByEmail',email);
    console.log('then call',callback);
   
 	client.connect(function(err, client, done) {
    
   	 client.query("SELECT * from logintest where email=$1", [email], function(err, result){
      	  if(err){
         	   return callback(err, isAvailable, this);
        		}
       		
       		//user found
        		if (result.rowCount === 1){
            	 	  console.log(email + ' was found!');
            	
            	 	  var user = new User();
                    user.email= result.rows[0]['email'];
                    user.password = result.rows[0]['password'];
                    user.database_id = result.rows[0]['id'];

            	     done();//disconnect from db
            	     
            	     return callback(null,isAvailable, user);
        		}
        		//no error, but the email has no account
        		if (result.rowCount === 0) {
            	isAvailable = true;
            	console.log(email + ' is available');
            	 done();//disconnect from db
            	 return callback(null, isAvailable, null);
        		}
       

        done();//disconnect from db
        
       
   	 });
	});
};

User.findById = function(id, callback){

    console.log('looking for id in User.findById',id);
   
 	client.connect(function(err, client, done) {
    
   	 client.query("SELECT * from logintest where id=$1", [id], function(err, result){
      	  if(err){
         	   return callback(err, null);
        		}
       
        		if (result.rowCount === 1){
            	 console.log(id + ' found!');
            	 	  var user = new User();
                    user.email= result.rows[0]['email'];
                    user.password = result.rows[0]['password'];
                    user.database_id = result.rows[0]['id'];
                    done();
                   return callback(null,user);
        		}else {
        			 done();
        			return callback("ID NOT FOUND", null);
        		}
        		
   	 });
	});
};

//WHEN IMPORTED
//module.exports = User;


//****************************************************************
//		END file:		USER.JS  
//****************************************************************



//****************************************************************
//		file:		PASSPORT.JS  
//****************************************************************
// when we expose this function to our app using module.exports
// load all the things we need
/*
var LocalStrategy   = require('passport-local').Strategy;
var pg           = require('pg');

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
var client = new pg.Pool(connectionString);

// load up the user model
var User            = require('../SomePath/user');
*/
//module.exports = function(passport) {

//since this is NOT imported as module, name it
 function configPassport(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session


	//SEE THIS FOR MORE INFO:
	//http://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log(user.database_id +" was seralized");
        done(null, user.database_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log(id + " is deserialized");
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login',new LocalStrategy({
    			//theses should be the KEY values from the login post request
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
         	User.findByEmail(email, function(err, isAvailable,user) {
                // if there are any errors, return the error before anything else
                if (err) return done(err);

                // if no user is found, return the message
                if (isAvailable) return done(null, false, console.log('loginMessage: No user found, available.')); // req.flash is the way to set flashdata using connect-flash

                // all is well, return successful user
                return done(null, user);
            });

        }));
	
	return passport;
    };



//***********************************************
//		END file:     PASSPORT.JS
//***********************************************

//https://github.com/jaredhanson/passport
passport = configPassport(passport);

// required for passport
app.use(session({ secret: 'iAMsoSECRET_1984' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// process the login form
// app.post('/login', do all our passport stuff here);
// process the login form
app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/home', // redirect back to the signup page if there is an error
        failureFlash : false // allow flash messages
    }));
    
 app.get('/login', isLoggedIn, function(req, res) {
        console.log(req.user);
        res.sendFile(__dirname+'/login.html')
    });
 app.get('/home', function(req, res) {
        console.log(req.user);
        res.sendFile(__dirname+'/home.html')
    });
 // middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        console.log('isLoggedin');
        return next();
    }
    console.log('is not logged in');

    // if they aren't redirect them to the home page
    res.redirect('/home');
}

   

 
 
