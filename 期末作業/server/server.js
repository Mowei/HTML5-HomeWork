var MUSIC = 0;
var CHAT_MESSAGE=1;

var ws = require('websocket.io'), http = require('http').createServer().listen(8000), server = ws.attach(http)
var sockets = [];

server.addListener("connection", function(conn) {

	sockets.push(conn);
	var id = sockets.indexOf(conn);

	// init stuff on connection
	console.log("A connection established with id", id);
	var message = "Welcome " + id + " joining the party. Total connection:" + sockets.length;
	var data = {};
	data.dataType = CHAT_MESSAGE;
	data.sender = "Server";
	data.message = message;
	broadcast(JSON.stringify(data));

	// listen to the message
	conn.addListener("message", function(message) {
		
		console.log("Got data '" + message + "' from connection " + id);
		var data = JSON.parse(message);
		if (data.dataType == CHAT_MESSAGE) {
			// add the sender information into the message data object.
			data.sender = data.name;
		}
		broadcast(JSON.stringify(data));

	});
	conn.on('close', function () { 
		try{
			for(key in sockets){
				if(sockets[key] == conn){
					sockets.splice(key,1);
					console.log('Remove socket from collection. Current length'+ sockets.length);
					break;
				}
			}conn.close();

		}catch(e){
				console.log(e);
			}
  });
  
});


console.log("WebSocket server is running.");
console.log("Listening to port 8000."); 



	
function broadcast(message) {

	for(key in sockets){
		sockets[key].send(message);
	}

}