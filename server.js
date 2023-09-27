var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connections = [];

let rooms = [];

class Player {
    constructor(username, socket){
        this.username = username;
        this.socket = socket.id;
        this.lives = 2;
    }
}

class Game {
    constructor(idRoom){
        this.idRoom = idRoom;
        this.players = [];
        this.idPlayerToPlay = 0;
        this.playerToPlay = null;
    }

    addPlayer(player){
        this.players.push(player);
    }

    removePlayer(player){
        this.players.splice(this.players.indexOf(player), 1);
    }

    nextTurn(){
        this.idPlayerToPlay++;
        this.idPlayerToPlay = this.idPlayerToPlay%this.players.length;
        this.playerToPlay = this.players[this.idPlayerToPlay];
    }

    begin(){
        // Assigne un joueur au hasard pour commencer
        this.idPlayerToPlay = Math.floor(Math.random() * this.players.length);
        this.playerToPlay = this.players[this.idPlayerToPlay];
    }
}

function getRoom(id){
    for(let i = 0; i < rooms.length; i++){
        if(rooms[i].id == id){
            return rooms[i];
        }
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

    // Création de la room
    socket.on('connect to game', function(id){
        // redirection du socket concerné vers la room
        if(getRoom(id)){
            socket.join(id);
        }
        else {
            rooms.push({id: id, game: new Game(id)});
            socket.join(id);
        }
        console.log(socket);
        io.to(id).emit('redirect', '/game.html?id=' + id);
    });

    // Rejoindre la room
    socket.on('join the game', function(username, id){
        
        // ajout du joueur dans la game de la room
        let game = null;
        if(getRoom(id)){
            game = getRoom(id).game;
        }
        else {
            socket.emit('redirect', '/');
            return;
        }

        let player = game.addPlayer(new Player(username, socket));
        socket.username = Player.username;
        io.to(game.idRoom).emit('update users', game.players);
    });

    // Commencer la partie
    socket.on('begin', function(id){
        let game = null;
        if(getRoom(id)){
            game = getRoom(id).game;
        }
        else {
            socket.emit('redirect', '/');
            return;
        }

        // Commencer la partie
        game.begin();

        console.log(game);

        // Enlever le bouton begin
        io.to(game.idRoom).emit('remove begin button');

        // Afficher les lettres à tous les joueurs
        io.to(game.idRoom).emit('show letters');

        // Envoie à un joueur qu'il doit jouer
        io.to(game.playerToPlay.socket).emit('your turn', game.playerToPlay.username);

        // Reçoit le mot du joueur
        socket.on('word', function(word, id){
            // Vérifie si le mot est valide
            if(word.length < 3){
                io.to(game.playerToPlay.socket).emit('invalid word', word);
            }
            else {
                // Vérifie si le mot est dans le dictionnaire
                let validWord = true;
                // Si oui, envoie le mot à tous les joueurs 
                if(!validWord){
                    if(game.playerToPlay.lives > 0){
                        game.playerToPlay.lives--;
                    }
                    else {
                        io.to(game.playerToPlay.socket).emit('lose');
                        game.removePlayer(game.playerToPlay);
                    }
                }
                game.nextTurn();
                io.to(game.playerToPlay.socket).emit('your turn', game.playerToPlay.username);               
            }
        });
    });



    // Disconnect
    socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});