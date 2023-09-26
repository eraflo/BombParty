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
if(createButton)
    createButton.addEventListener('click', function(){
        console.log(idTemp);
        setCookie('idRoom', idTemp, 1);
        deleteCookie('idTemp');
        socket.emit('connect to game', idTemp);
});

if(joinRoom) {
    joinRoom.addEventListener('click', function(){
        var id = document.getElementById('idRoomJoin').value;
        deleteCookie('idTemp');
        setCookie('idRoom', id, 1);
        socket.emit('connect to game', id);
    });
}

if(joinButton) {
    joinButton.addEventListener('click', function(){
        socket.emit('join the game', username.value);
        body.removeChild(document.getElementById('usernames'));
        body.appendChild(document.createElement('div').setAttribute('id', 'game'));
        document.getElementById('game').innerHTML = '<h1>Game</h1>';
        document.getElementById('game').innerHTML += '<button id="begin">Begin</button>';
        document.getElementById('begin').addEventListener('click', function(){
            socket.emit('begin');
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

socket.on('begin', function() {
    body.removeChild(document.getElementById('game'));
    body.appendChild(document.createElement('div').setAttribute('id', 'game'));
    document.getElementById('game').innerHTML += '<section id="Letters"><h1>Letters</h1><div id="lettersDiv"></div></section><input type="text" id="name" placeholder="name"><button id="submit">Submit</button>';
});