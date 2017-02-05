/*
PROPS TO:
https://scotch.io/tutorials/easy-node-authentication-setup-and-local
and
https://github.com/brianc/node-postgres/wiki/Parameterized-queries-and-Prepared-Statements
*/

https://github.com/brianc/node-postgres
var pg = require('pg');


var passport = require('passport')

//https://github.com/jaredhanson/passport-facebook
var FacebookStrategy = require('passport-facebook').Strategy;

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
function User() {    
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

User.findByFacebook = function(fbProfile, callback){
	console.log(fbProfile);
	/*
	
	This should be part of a database lookup, but to keep it simple just create a user for the callback.
	see login_passport.js for example of db connection	
	
	*/
	 			var user = new User();
             	 user.firstName = fbProfile._json.first_name;
             	  console.log("HI: ",fbProfile._json.first_name);
                user.photo = fbProfile.photos[0].value;
              console.log("PHOTO: ",fbProfile.photos[0].value);
              user.database_id = fbProfile._json.id;
              console.log("FB id: ",fbProfile._json.id);
            	 return callback(null, user);
}

User.findByEmail = function(email, callback){

    var isAvailable = false; //change to true if email not found in db
   
    console.log('looking for email in User.findByEmail',email);
    console.log('then call',callback);
   
 	client.connect(function(err, client, done) {
    
   	 client.query("SELECT * from logintest where email=$1", [email], function(err, result){
      	  if(err){
         	   return callback(err, isAvailable, this);
        		}
       
        		if (result.rowCount === 1){
            	 console.log(email + ' was found!');
            	
            	 	  var user = new User();
                    user.email= result.rows[0]['email'];
                    user.password = result.rows[0]['password'];
                    user.database_id = result.rows[0]['id'];
                    done();
                   return callback(null,user);
            	  done();//disconnect from db
            	 return callback(false, user);
        		}
        		else {
            	isAvailable = true;
            	console.log(email + ' is available');
            	//no error, but the email has no account
            	 done();//disconnect from db
            	 return callback(false, false);
        		}
        //the callback has 3 args:
        // arg err: false if there is no error
        // arg isAvailable: whether the email is available or not
        // arg this: the User object;

        done();//disconnect from db
        
        //return callback(false, isAvailable, this);
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
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use('facebook-login', new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID        : '954261538041538',
            clientSecret    : '82c3c35b10b27be95c6aeb0a97558ac5',
            callbackURL     : 'http://localhost:5000/login/callback',
            profileFields: ['id', 'name','picture.type(large)', 'emails', 'displayName', 'about', 'gender'], 
            
            //RETURN FROM FB:
            /*
			{ id: '10100575364401165',
  				username: undefined,
  				displayName: 'Jared Nugent',
  				name: 
  				 { familyName: undefined,
     				givenName: undefined,
    				 middleName: undefined },
  				gender: undefined,
  				profileUrl: undefined,
 				provider: 'facebook',
  				_raw: '{"name":"Jared Nugent","id":"10100575364401165"}',
 			   _json: { name: 'Jared Nugent', id: '10100575364401165' }
 			 }

				*/
        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {


                // find the user in the database based on their facebook id
               // User.findByFacebook({ 'facebook.id' : profile.id }, function(err, user) {
					User.findByFacebook( profile, function(err, user) {
                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                    	
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
								
								console.log(newUser)	
								
                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });

        }));

		return passport;
	}

//***********************************************
//		END file:     PASSPORT.JS
//***********************************************


passport = configPassport(passport);

// required for passport
app.use(session({ secret: 'topSecretStuff411' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// process the login form
// app.post('/login', do all our passport stuff here);
// process the login form
app.post('/login', passport.authenticate('facebook-login', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/home', // redirect back to the signup page if there is an error
        failureFlash : false // allow flash messages
    }));
    
    
app.get('/login',
  passport.authenticate('facebook-login'));


//facebook will return user here
app.get('/login/callback',
  passport.authenticate('facebook-login', { 
  failureRedirect: '/home' }),
  function(req, res) {
    // Successful authentication, redirect home.
     res.sendFile(__dirname+'/login.html')
  });    
    
    
/*
//facebook will return user here
 app.get('/login/callback', isLoggedIn, function(req, res) {
        console.log(req.user);
        res.sendFile(__dirname+'/login.html')
    });
*/
 app.get('/home', function(req, res) {
        console.log(req.user);
        res.sendFile(__dirname+'/home.html')
    });
 
 // route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        console.log('isLoggedin');
        return next();
    }
    console.log('is not logged in');

    // if they aren't redirect them to the home page
    res.redirect('/');
}

   
/*
app.post('/login', 
    passport.authenticate('local-login', { 
    	failureRedirect: '/home', 
    	failureFlash: true }),
    function(req, res) {
        res.redirect('/login');
});
*/
/*
app.post('/login', (request,response,next) => {
		console.log(request.body)
			passport.authenticate('local-login', (err, user, info) => {
				console.log("AUTH")
   		 if (err) { 
   		 	console.log(err)
   		 	response.sendFile(__dirname+'/home.html')}
   		 if (!user) { 
   		 	console.log('no user',err, user, info)
   		 	response.sendFile(__dirname+'/home.html')}
    		if (user) { 
    			console.log('found user')
    			response.sendFile(__dirname+'/login.html')
    			}
  		})(request, response, next);
   });
 */
 
 
