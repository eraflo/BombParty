const Game = require('./game.js');
const Player = require('./player.js');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connections = [];

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
        if(getRoom(id)){
            socket.join(id);
        }
        else {
            rooms.push({id: id, game: new Game(id)});
            socket.join(id);
        }
        io.to(id).emit('redirect', '/game.html?id=' + id);
    });

    // Rejoindre la room
    socket.on('join the game', function(username, id){
        
        // Réajoute le joueur dans la room
        socket.join(id);

        // ajout du joueur dans la game de la room
        let game = getGame(id);

        if(game != null){
            let player = game.addPlayer(new Player(username, socket));
            socket.username = Player.username;
            io.to(game.idRoom).emit('update users', game.players);
        }
        else {
            // redirection vers la page d'accueil
            io.to(socket.id).emit('redirect', '/');
        }
    });

    // Commencer la partie
    socket.on('begin', function(id){
        let game = getGame(id);

        // Commencer la partie
        game.begin();

        console.log(game);

        // Enlever le bouton begin
        io.to(game.idRoom).emit('remove begin button');

        // Génère les lettres
        io.to(game.playerToPlay.socket).emit('generate letters');

        socket.on('letters generated', function(){
            console.log('letters generated');
            // Ajoute les lettres à la game
            // game.addLetters(letters);

            // // Envoie les lettres à tous les joueurs
            io.to(game.idRoom).emit('show letters', letters);

            // // Envoie à un joueur qu'il doit jouer
            // io.to(game.playerToPlay.socket).emit('your turn', game.playerToPlay.username);
        });


        // Reçoit le mot du joueur
        io.on('word', function(word, id){
            // Vérifie si le mot est valide
            if(word.length < 3){
                io.to(game.playerToPlay.socket).emit('invalid word', word);
            }
            else {
                // Vérifie si le mot est dans le dictionnaire
                let validWord = true;
                // Si oui, envoie le mot à tous les joueurs 
                if(validWord){
                    game.nextTurn();
                    game.removeLetters();
                    //io.to(game.playerToPlay.socket).emit('valid word', word);
                    io.to(game.playerToPlay.socket).emit('your turn', game.playerToPlay.username);  
                }
                             
            }
        });

        // Deconnexion
        socket.on('disconnect', function(){
            game.removePlayer(game.getPlayerWithSocket(socket));
            io.to(game.idRoom).emit('update users', game.players);
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