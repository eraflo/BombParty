const Game = require('./server/js/game.js');
const Player = require('./server/js/player.js');
const Bomb = require('./server/js/bomb.js');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const debug = require('debug')('app:server');

let connections = [];
let rooms = [];

function getRoom(id){
    for(let i = 0; i < rooms.length; i++){
        if(rooms[i].id == id){
            return rooms[i];
        }
    }
}

function getGame(id){
    let game = null;
    if(getRoom(id)){
        game = getRoom(id).game;
    }
    else {
        return;
    }
    return game;
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
        if(!getRoom(id)){
            rooms.push({id: id, game: new Game(id, new Bomb())});
        }
        io.to(socket.id).emit('redirect', '/game.html?id=' + id);
    });

    // Rejoindre la room
    socket.on('join the game', function(username, id){
        // Récupère la game de la room
        let game = getGame(id);
        
        // ajout du joueur dans la game de la room
        if(game != null && !game.hasBegun){
            
            // Réajoute le joueur dans la room
            socket.leaveAll();
            socket.join(game.idRoom);

            if(!game.isPlayerInGame(socket)) {
                // Crée le player et l'ajoute
                game.addPlayer(new Player(username, socket));
                io.to(game.idRoom).emit('update users', game.players);

                // Envoie l'id de la room aux joueurs
                io.to(game.idRoom).emit('id', game.idRoom);
            }
        }
        else {
            // redirection vers la page d'accueil
            io.to(socket.id).emit('redirect', '/');
        }
    });

    // Commencer la partie
    socket.on('begin', function(id){
        // Récupère la game de la room
        let game = getGame(id);

        // Commencer la partie
        if(!game.begin()) {
            return;
        }

        // update users
        io.to(game.idRoom).emit('update users', game.players);

        // Enlever le bouton begin
        io.to(game.idRoom).emit('remove begin button');

        // Ajoute les lettres à la game
        game.addLetters();

        // // Envoie les lettres à tous les joueurs
        io.to(game.idRoom).emit('show letters', game.letters);

        // // Envoie à un joueur qu'il doit jouer
        io.to(game.idRoom).emit('play', game.playerToPlay.socket, game.playerToPlay.username);

        // Init temps aléatoire bomb
        game.bomb.initTime(io, game);
    });

    // Reçoit le mot du joueur
    socket.on('word', function(word, id){
        // Récupère la game de la room
        let game = getGame(id);


        // Vérifie si le mot est valide
        game.checkWord(word, id, io);
    });

    // Le joueur écrit 
    socket.on('writing', function(id, text){
        // Récupère la game de la room
        let game = getGame(id);

        if(text.includes('|')){
            text = text.replace('|', '');
            text = text.substring(0, text.length - 1);
        }

        // Envoie à tous les joueurs que le joueur écrit
        io.to(game.idRoom).emit('writing', text);
    });

   
    // Disconnect
    socket.on('disconnect', function(data){
        if(rooms.length > 0){
            rooms.forEach(element => {

                // Si un joueur se déconnecte, il est supprimé de la room
                element.game.players.forEach(player => {
                    if(player.socket == socket.id){
                        element.game.removePlayer(player);
                        element.game.nextTurn(io);
                        socket.leave(element.game.idRoom);
                        socket.to(element.game.idRoom).emit('update users', element.game.players);
                    }
                });

            });
        }

        // Supprime le socket de la liste des sockets
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });        
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});