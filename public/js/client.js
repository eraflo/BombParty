import { getCookie, setCookie, deleteCookie, getIdFromUrl } from './cookie.js';
let socket = io();

// DOM elements
let createButton = document.getElementById('create');
let joinRoom = document.getElementById('joinRoom');
let joinButton = document.getElementById('join');
let idTemp = getCookie('idTemp');
let username = document.getElementById('username');

let body = document.body;
let buttonText = "Begin";
let titleText = "Game";

// Event listeners

// Création room
if (createButton)
    createButton.addEventListener('click', function () {
        deleteCookie('idTemp');
        socket.emit('connect to game', idTemp);
        socket.emit('host', idTemp);
    });

// Join room
if (joinRoom) {
    joinRoom.addEventListener('click', function () {
        let id = document.getElementById('idRoomJoin').value;
        deleteCookie('idTemp');
        socket.emit('connect to game', id);
    });
}

// Join Room touche enter
if(document.getElementById('idRoomJoin')){
    document.getElementById('idRoomJoin').addEventListener('keydown', function(event){
        if(event.key == 'Enter'){
            let id = document.getElementById('idRoomJoin').value;
            deleteCookie('idTemp');
            socket.emit('connect to game', id);
        }
    });
}

// Join game
if (joinButton) {
    joinButton.addEventListener('click', function () {
        // récupérer l'id via l'url
        socket.emit('join the game', username.value, getIdFromUrl());
        document.getElementById('usernames').remove();

        let header = document.querySelector('header');
        header.innerHTML = '<div id="left"><h1><span>C</span>a <span>E</span>xplose <span>S</span>on <span>I</span>ngé</h1><p>Un BombParty spécial CESI</div><div id="right"><h1 id="room">In room </h1></div>';

        let main = document.querySelector('#main');
        main.innerHTML = '<section id="players"></section><section id="game"></section>';

        // emit event pour savoir si est host
        socket.emit('is host', getIdFromUrl());
    });
}

// Join game touche enter
if(document.getElementById('username')){
    document.getElementById('username').addEventListener('keydown', function(event){
        if(event.key == 'Enter'){
            // récupérer l'id via l'url
            socket.emit('join the game', username.value, getIdFromUrl());
            document.getElementById('usernames').remove();

            let header = document.querySelector('header');
            header.innerHTML = '<div id="left"><h1><span>C</span>a <span>E</span>xplose <span>S</span>on <span>I</span>ngé</h1><p>Un BombParty spécial CESI</div><div id="right"><h1 id="room">In room </h1></div>';

            let main = document.querySelector('#main');
            main.innerHTML = '<section id="players"></section><section id="game"></section>';

            // emit event pour savoir si est host
            socket.emit('is host', getIdFromUrl());
        }
    });
}

// Socket events
socket.on('id', function (id) {
    if (!document.querySelector('#room').innerHTML.includes(id)) {
        document.querySelector('#room').innerHTML += id;
    }
});

socket.on('host', function () {
    console.log('host');
    let game = document.querySelector('#game');
    game.innerHTML = '<h1 class="title">' + titleText + '</h1>';
    game.innerHTML += '<button id="begin">' + buttonText + '</button>';
    document.querySelector('#begin').addEventListener('click', function () {
        socket.emit('begin', getIdFromUrl());
    });
});

socket.on('redirect', function (destination) {
    // redirect to game.html
    window.location.href = destination;
});

socket.on('update users', function (users) {
    let players = document.querySelector('#players');
    players.innerHTML = '<h1>Players</h1>';
    for (let i = 0; i < users.length; i++) {
        players.innerHTML += '<p>' + users[i].username + ' : ' + users[i].lives + ' lives</p>';
    }
});

socket.on('remove begin button', function () {
    if(document.querySelector('#begin'))
        document.querySelector('#begin').remove();
    if(document.querySelector('.title'))
        document.querySelector('.title').remove();
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
    document.getElementById('game').innerHTML += '<section id="turn"><h1 id="player-turn">' + username + ' turn :\t<span id="write"></span></h1></section>';

    if (idSocket == socket.id) {
        // input pour saisir un mot avec les lettres
        document.querySelector('#game').innerHTML += '<section id="input"><h1>Enter your word</h1><div class="form"><input type="text" id="word" autofocus><button id="submit">Submit</button></div></section>';
        
        document.querySelector('#word').focus();
        document.querySelector('#word').addEventListener('input', function () {
            socket.emit('writing', getIdFromUrl(), document.querySelector('#word').value);
        });

        document.querySelector('#word').addEventListener('keydown', function (event) {
            if (event.key == 'Enter') {
                socket.emit('word', document.getElementById('word').value, getIdFromUrl());
            }
            else if (event.key == 'Backspace') {
                socket.emit('writing', getIdFromUrl(), document.querySelector('#write').value + '|');
            }
        });

        document.getElementById('submit').addEventListener('click', function () {
            socket.emit('word', document.getElementById('word').value, getIdFromUrl());
        });
    }
});

// writing
socket.on('writing', function (text) {
    if (text == '' || text == null || text == undefined) {
        text = ' ';
    }
    if(document.querySelector('#write')){
        document.querySelector('#write').innerHTML = text;
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
        document.querySelector('#input').remove();
    }
    document.querySelector('#turn').remove();

});

socket.on('end game', function (winner) {
    // Affiche le gagnant
    document.querySelector('#game').innerHTML += '<section id="winner"><h1>' + winner + ' win !</h1></section>';

    setTimeout(function () {
        document.querySelector('#winner').remove();
    }, 3000);
});