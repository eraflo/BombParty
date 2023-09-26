var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];
var connections = [];

class Player {
    constructor(username, id){
        this.username = username;
        this.id = id;
        this.lives = 2;
    }
}

// Static files
app.use(express.static('public'));

// Routes
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});


// Socket.io
io.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    socket.on('connect to game', function(id){
        // redirection du socket concerné vers la room
        socket.join(id);
        io.to(id).emit('redirect', '/game.html?id=' + id);
    });

    socket.on('join the game', function(username){
        var player = new Player(username, socket.id);
        socket.username = Player.username;
        users.push(player);
        console.log(socket.rooms);
        console.log(users);
        io.emit('update users', users);
    });

    // Disconnect
    socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket), 1);
        users.splice(users.indexOf(socket.username), 1);
        socket.leave(socket.id);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});