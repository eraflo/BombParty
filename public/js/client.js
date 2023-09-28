import { getCookie, setCookie, deleteCookie, getIdFromUrl } from './cookie.js';
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
if (createButton)
    createButton.addEventListener('click', function () {
        deleteCookie('idTemp');
        socket.emit('connect to game', idTemp);
    });

// Join room
if (joinRoom) {
    joinRoom.addEventListener('click', function () {
        let id = document.getElementById('idRoomJoin').value;
        deleteCookie('idTemp');
        socket.emit('connect to game', id);
    });
}

// Join game
if (joinButton) {
    joinButton.addEventListener('click', function () {
        // récupérer l'id via l'url
        socket.emit('join the game', username.value, getIdFromUrl());
        document.getElementById('usernames').remove();

        let header = document.querySelector('header');
        header.innerHTML = '<div id="left"><h1>CESI : Ca Explose Son Ingé</h1></div><div id="right"><h1 id="room">In room </h1></div>';

        let main = document.querySelector('#main');
        main.innerHTML = '<section id="players"></section><section id="game"></section>';


        let game = document.querySelector('#game');
        game.innerHTML = '<h1>Game</h1>';
        game.innerHTML += '<button id="begin">Begin</button>';
        document.querySelector('#begin').addEventListener('click', function () {
            socket.emit('begin', getIdFromUrl());
        });
    });
}

// Socket events
socket.on('id', function (id) {
    if (!document.querySelector('#room').innerHTML.includes(id)) {
        document.querySelector('#room').innerHTML += id;
    }
});

socket.on('redirect', function (destination) {
    // redirect to game.html
    window.location.href = destination;
});

socket.on('update users', function (users) {
    let players = document.querySelector('#players');
    players.innerHTML = '<h1>Players</h1>';
    for (let i = 0; i < users.length; i++) {
        players.innerHTML += '<p>' + users[i].username + '</p>';
    }
});

socket.on('remove begin button', function () {
    document.querySelector('#begin').remove();
});

socket.on('show letters', function (letters) {
    // Création de la section des lettres
    if (document.querySelector('#Letters') == null) {
        document.querySelector('#game').innerHTML += '<section id="Letters"><h1>Letters</h1><div id="lettersDiv"></div></section>';

        // Création des divs pour les lettres
        let lettersDiv = document.querySelector("#lettersDiv");
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

socket.on('play', function (idSocket, username) {
    // Création de la section du tour
    document.getElementById('game').innerHTML += '<section id="turn"><h1>' + username + ' turn</h1></section>';

    if (idSocket == socket.id) {
        // input pour saisir un mot avec les lettres
        document.getElementById('game').innerHTML += '<section id="input"><h1>Enter your word</h1><input type="text" id="word"><button id="submit">Submit</button></section>';
        document.getElementById('submit').addEventListener('click', function () {
            socket.emit('word', document.getElementById('word').value, getIdFromUrl());
        });
    }
});

socket.on('invalid word', function (word, idSocket) {
    if (idSocket == socket.id) {
        console.log("Invalid word");
    }
});

socket.on('end turn', function (socketPlayer) {
    // enlève le html du joueur qui finit
    if (socketPlayer == socket.id) {
        document.getElementById('input').remove();
    }
    document.getElementById('turn').remove();

});

socket.on('end game', function () {
    document.getElementById('game').innerHTML = '<h1>Game ended</h1>';

    // Bouton rejouer
    document.getElementById('game').innerHTML += '<button id="reset">Rejouer</button>';
    document.getElementById('reset').addEventListener('click', function () {
        // Enleve le bouton et le titre
        document.getElementById('reset').remove();

        // Rajoute le titre
        let game = document.getElementById('game');
        game.innerHTML = '<h1>Game</h1>';

        socket.emit('begin', getIdFromUrl());
    });
});