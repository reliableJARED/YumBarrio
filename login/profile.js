// exposes a global for our socket connection
//var socket = io();
 
	//	socket.on('profile',function(facebookProfileJSON){
						
	//	console.log(facebookProfileJSON);
//}); 
 
 console.log('test connection')
 	// exposes a global for our socket connection
	var socket = io();
	socket.on('connect',function(msg){
			console.log('connected')	
		});
		
	var firstName;
	socket.on('firstname',function(msg){
			console.log(msg);
			document.getElementById('firstname').innerHTML = msg;	
		});
