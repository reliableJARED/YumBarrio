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

var sessionMiddleware = session({
    name: "iamcookie",
    secret: "topSecretStuff411",
});




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
//dir with socketio code
app.use(serveStatic(__dirname + '/socket.io/'));
app.use(serveStatic(__dirname + '/login/callback'));


//****MIDDLE WARE FOR AUTH PROTECT DIRECTORY
//http://stackoverflow.com/questions/21335868/how-to-protect-static-folder-in-express-with-passport
//req.user is assigned by passport.  if they are not logged in this should prevent access to this directory
app.use(function(req, res, next) {
    if (req.user == null && req.path.indexOf('/callback') === 0)
    {
        res.redirect('/home');
    }
    next(); 
});


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
 
//serve HTML to initial get request
app.get('/', function(request, response){
	response.sendFile(__dirname+'/home.html');
});

 

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
         	  // return callback(err, null);
         	  
         	  //****** REMOVE THIS!!!**********
         	  //below is for testing only, all cases return user
         	  console.log(id + ' found!');
            	 	  var user = new User();
                    user.email= 'test';
                    user.password = 'test';
                    user.database_id = 'test';
                    done();
                   return callback(null,user);
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
        			// done();
        			//return callback("ID NOT FOUND", null);
        			 //****** REMOVE THIS!!!**********
         	  //below is for testing only, all cases return user
         	  console.log(id + ' found!');
            	 	  var user = new User();
                    user.email= 'test';
                    user.password = 'test';
                    user.database_id = 'test';
                    done();
                   return callback(null,user);
        		}
        		
   	 });
	});
};


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
app.use(sessionMiddleware); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


//A server that integrates with (or mounts on) the Node.JS HTTP Server: socket.io
//http://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io
var io = require('socket.io')(http) 
	.use(function(socket, next){
        // Wrap the express middleware
        console.log('IO MID WARE: ',Object.keys(socket));
        sessionMiddleware(socket.request,{}, next)
    })
    .on("connection", function(socket){
        var userId = socket.request.session.passport.user;
        console.log("Socket-info from passport", userId);
        console.log("Socket ID:", socket.id)
    });







// process the login form
// app.post('/login', do all our passport stuff here);
// process the login form
app.post('/login', passport.authenticate('facebook-login', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/home', // redirect back to the signup page if there is an error
        failureFlash : false // allow flash messages
    }));
    
    
app.get('/login',
  passport.authenticate('facebook-login')
  );


//facebook will return user here
app.get('/login/callback',
  passport.authenticate('facebook-login', { 
  failureRedirect: '/home' }),
  function(req, res) {

	console.log('USER::: ',req.user)  	
	console.log(req.path);	
 
    // Successful authentication, redirect home.
    console.log('DIR: ', __dirname)
     res.sendFile(__dirname+'/login.html');
     
	
  });    


    

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

   

 
 
