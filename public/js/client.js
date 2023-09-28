import { getCookie, setCookie, deleteCookie } from './cookie.js';
let socket = io();

// DOM elements
let createButton = document.getElementById('create');
let joinRoom = document.getElementById('joinRoom');
let joinButton = document.getElementById('join');
let idTemp = getCookie('idTemp');
let username = document.getElementById('username');

let body = document.body;

// Event listeners

// Création room
if(createButton)
    createButton.addEventListener('click', function(){
        console.log(idTemp);
        setCookie('idRoom', idTemp, 1);
        deleteCookie('idTemp');
        socket.emit('connect to game', idTemp);
});

// Join room
if(joinRoom) {
    joinRoom.addEventListener('click', function(){
        var id = document.getElementById('idRoomJoin').value;
        deleteCookie('idTemp');
        setCookie('idRoom', id, 1);
        socket.emit('connect to game', id);
    });
}

// Join game
if(joinButton) {
    joinButton.addEventListener('click', function(){
        socket.emit('join the game', username.value, getCookie('idRoom'));
        document.getElementById('usernames').remove();

        let game = document.getElementById('game');
        game.innerHTML = '<h1>Game</h1>';
        game.innerHTML += '<button id="begin">Begin</button>';
        document.getElementById('begin').addEventListener('click', function(){
            socket.emit('begin', getCookie('idRoom'));
        });
    });
}

// Socket events
socket.on('redirect', function(destination) {
    // redirect to game.html
    window.location.href = destination;
});

socket.on('update users', function(users) {
    let players = document.getElementById('players');
    players.innerHTML = '<h1>Players</h1>';
    for(let i = 0; i < users.length; i++) {
        players.innerHTML += '<p>' + users[i].username + '</p>';
    }
});

socket.on('remove begin button', function() {
    document.getElementById('begin').remove();
});

socket.on('show letters', function(letters) {
    // Création de la section des lettres
    if(document.getElementById('Letters') == null) {
        document.getElementById('game').innerHTML += '<section id="Letters"><h1>Letters</h1><div id="lettersDiv"></div></section>';
    
        // Création des divs pour les lettres
        let lettersDiv = document.getElementById("lettersDiv");
        let letterDiv = document.createElement('div');
        letterDiv.classList.add('letter');

        // Ajout des lettres dans le DOM
        letterDiv.textContent = letters;
        lettersDiv.appendChild(letterDiv);
    } else {
        // Ajout des lettres dans le DOM
        document.querySelector(".letter").innerHTML = letters;
    }
    
});

socket.on('play', function(idSocket, username) {

    document.getElementById('game').innerHTML += '<section id="turn"><h1>' + username + ' turn</h1></section>';
    
    if(idSocket == socket.id) {
        // input pour saisir un mot avec les lettres
        document.getElementById('game').innerHTML += '<section id="input"><h1>Enter your word</h1><input type="text" id="word"><button id="submit">Submit</button></section>';
        document.getElementById('submit').addEventListener('click', function(){
            socket.emit('word', document.getElementById('word').value, getCookie('idRoom'));
        });
    }
});

socket.on('invalid word', function(word, idSocket) {
    if(idSocket == socket.id) {
        console.log("Invalid word");
    }
});

socket.on('end turn', function(socketPlayer) {
    // enlève le html du joueur qui finit
    if(socketPlayer == socket.id) {
        document.getElementById('input').remove();
    }
    document.getElementById('turn').remove();

});

socket.on('end game', function() {
    document.getElementById('game').innerHTML = '<h1>Game ended</h1>';

    // Bouton rejouer
    document.getElementById('game').innerHTML += '<button id="reset">Rejouer</button>';
    document.getElementById('reset').addEventListener('click', function(){
        // Enleve le bouton et le titre
        document.getElementById('reset').remove();

        // Rajoute le titre
        let game = document.getElementById('game');
        game.innerHTML = '<h1>Game</h1>';

        socket.emit('begin', getCookie('idRoom'));
    });
});