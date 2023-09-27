import { getCookie, setCookie, deleteCookie } from './cookie.js';
var socket = io();

// DOM elements
var createButton = document.getElementById('create');
var joinRoom = document.getElementById('joinRoom');
var joinButton = document.getElementById('join');
var idTemp = getCookie('idTemp');
var username = document.getElementById('username');

var body = document.body;

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
        document.getElementById('game').innerHTML = '<h1>Game</h1>';
        document.getElementById('game').innerHTML += '<button id="begin">Begin</button>';
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
    console.log(users);
});

socket.on('remove begin button', function() {
    document.getElementById('begin').remove();
});

socket.on('show letters', function() {
    document.getElementById('game').innerHTML += '<section id="Letters"><h1>Letters</h1><div id="lettersDiv"></div></section>';
});

socket.on('your turn', function(username) {
        document.getElementById('game').innerHTML += '<section id="turn"><h1>' + username + ' turn</h1></section>';

        // Formulaire de saisie des mots
        document.getElementById('game').innerHTML += '<section id="words"><h1>Words</h1><form id="formWords"><input type="text" name="word" id="word"><input type="submit" value="Send"></form></section>';
        document.getElementById('formWords').addEventListener('submit', function(e){
            e.preventDefault();
            socket.emit('word', document.getElementById('word').value, getCookie('idRoom'));
        });
    }
);

socket.on('invalid word', function(word) {
    
});