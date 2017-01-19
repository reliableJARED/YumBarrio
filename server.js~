/*
GOOD START POINT:
https://code.tutsplus.com/tutorials/authenticating-nodejs-applications-with-passport--cms-21619
and
http://stackoverflow.com/questions/38136792/typeerror-req-flash-is-not-a-function

to get mLab MongoDB URI. in CLI type: heroku config | grep MONGODB_URI
*/

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

var app = require('express')();

//Express initializes app to be a function handler that you can supply to an HTTP server
var http = require('http').Server(app);

//required for serving locally when testing
var serveStatic = require('serve-static');


var port = process.env.PORT || 5000; 

//var ip = '192.168.1.100'
//var ip = '192.168.1.103'
//var ip = '10.10.10.100'

//serve HTML to initial get request
app.get('/', function(request, response){
	response.sendFile(__dirname+'/home.html');
});

//listen for connections
//http.listen(port, ip,function(){  //on an IP
http.listen(port, function(){  //on an IP
	console.log('listening on port: '+port);
	console.log('serving files from root: '+__dirname);
	});	

//************** LOGIN
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd'
  },
  function(username, password, done) {
    // ...
  }
));
