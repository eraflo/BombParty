class Game {
    constructor(idRoom, bomb) {
        // Infos room
        this.idRoom = idRoom;

        // Infos game
        this.players = [];
        this.deadPlayers = [];

        this.idPlayerToPlay = 0;
        this.playerToPlay = null;

        this.hasBegun = false;
        this.nbTurnWithLetters = 1;
        this.isDeadThisTurn = false;

        // Infos lettres
        this.letters = "";
        this.fs = require('fs');

        this.files = [
            {language: "fr", filepath: "./server/ods6.txt"}
        ];
        this.language = "fr";

        // Infos bomb
        this.bomb = bomb;
    }

    addPlayer(player) {
        this.players.push(player);
    }

    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
    }

    getPlayerWithSocket(socket) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].socket == socket) {
                return this.players[i];
            }
        }
        return null;
    }

    isPlayerInGame(socket) {
        if (this.getPlayerWithSocket(socket) != null) {
            return true;
        }
        return false;
    }

    playerDied(socket) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].socket == socket) {
                this.deadPlayers.push(this.players[i]);
                this.players.splice(i, 1);
            }
        }
        this.isDeadThisTurn = true;
    }

    nextTurn(io) {
        // Fin du tour de l'ancien joueur
        io.to(this.idRoom).emit('end turn', this.playerToPlay.socket);

        // Vérifie qu'il n'y a pas de vainqueur
        if (this.players.length == 1) {
            this.end(io);
        }

        // Regarde si ça fait 2 tour qu'on a les lettres
        if (this.nbTurnWithLetters == 2) {
            this.nbTurnWithLetters = 1;
            this.letters = "";
            this.addLetters();
            io.to(this.idRoom).emit('show letters', this.letters);
        }
        else {
            this.nbTurnWithLetters++;
        }

        // Change le joueur actuel
        if(!this.isDeadThisTurn) {
            this.idPlayerToPlay++;
        }
        this.isDeadThisTurn = false;
        this.idPlayerToPlay = this.idPlayerToPlay % this.players.length;
        this.playerToPlay = this.players[this.idPlayerToPlay];
    }

    getDico(language, langTable) {
        let content = null;
        langTable.forEach(dico => {
            if(dico.language === language) {
                content = this.fs.readFileSync(dico.filepath, 'utf8');
                content = content.split('\n');
                return;
            }
        });
        return content;
    }

    pickLetters(array) {
        // Generate a random index to select a random string
        const randomStringIndex = Math.floor(Math.random() * array.length);
        const randomString = array[randomStringIndex];

        // Generate a random index to select a random position within the selected string
        const randomPosition = Math.floor(Math.random() * (randomString.length - 2));

        // Extract three consecutive letters starting from the random position
        const threeLetters = randomString.substr(randomPosition, 3);

        return threeLetters;
    }

    addLetters() {
        let content = this.getDico(this.language, this.files);

        this.letters = this.pickLetters(content);
    }

    removeLetters() {
        this.letters = '';
    }

    verifyWord(word) {

        if (!word.includes(this.letters)) {
            return false;
        }

        let content = this.getDico(this.language, this.files);

        let lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (word.toLowerCase() == lines[i].toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    checkWord(word, id, io) {
        if (word.length < 3) {
            io.to(id).emit('invalid word', word, this.playerToPlay.socket);
        }
        else {
            // Vérifie si le mot est dans le dictionnaire
            let valid = this.verifyWord(word);

            console.log(valid);

            // Si oui, envoie le mot à tous les joueurs 
            if (valid) {
                this.nextTurn(io);
                this.removeLetters();
                this.addLetters();
                this.bomb.increaseTime();
                io.to(this.idRoom).emit('play', this.playerToPlay.socket, this.playerToPlay.username);
            }

        }
    }

    exploseBomb(io, game) {
        // Enlève une vie au player dont c'est le tour
        game.playerToPlay.loseLife();

        // Vérifie status du player
        if (game.playerToPlay.statut == 1) {
            game.playerDied(game.playerToPlay.socket);
            io.to(game.idRoom).emit('player died', game.playerToPlay.username);
        }

        // Change le joueur dont c'est le tour
        game.nextTurn(io);

        if (game.hasBegun) {
            io.to(game.idRoom).emit('play', game.playerToPlay.socket, game.playerToPlay.username);
            game.bomb.initTime(io, game);
        }
    }


    begin() {
        // Remet tous les joueurs dead dans la liste des joueurs
        for (let i = 0; i < this.deadPlayers.length; i++) {
            this.players.push(this.deadPlayers[i]);
        }
        this.deadPlayers = [];

        // Reset les stats des joueurs
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].reset();
        }

        // Vérifie que le nombre de joueur est suffisant
        if (this.players.length == 0 || this.players.length == 1) {
            return false;
        }

        // Assigne un joueur au hasard pour commencer
        this.idPlayerToPlay = Math.floor(Math.random() * this.players.length);
        this.playerToPlay = this.players[this.idPlayerToPlay];
        this.hasBegun = true;
        this.letters = "";
        this.nbTurnWithLetters = 1;
        return true;
    }

    end(io) {
        this.hasBegun = false;
        io.to(this.idRoom).emit('end game');
    }
}

module.exports = Game;