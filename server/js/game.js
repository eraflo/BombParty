class Game {
    constructor(idRoom, bomb) {
        this.idRoom = idRoom;

        this.players = [];
        this.deadPlayers = [];

        this.idPlayerToPlay = 0;
        this.playerToPlay = null;

        this.letters = "";
        this.dico = require('fs');
        
        this.hasBegun = false;

        this.bomb = bomb;
        this.nbTurnWithLetters = 1;
    }

    addPlayer(player){
        this.players.push(player);
    }

    removePlayer(player){
        this.players.splice(this.players.indexOf(player), 1);
    }

    getPlayerWithSocket(socket){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].socket == socket){
                return this.players[i];
            }
        }
        return null;
    }

    isPlayerInGame(socket){
        if(this.getPlayerWithSocket(socket) != null){
            return true;
        }
        return false;
    }

    playerDied(socket){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].socket == socket){
                this.deadPlayers.push(this.players[i]);
                this.players.splice(i, 1);
            }
        }
    }

    nextTurn(io){
        // Fin du tour de l'ancien joueur
        io.to(this.idRoom).emit('end turn', this.playerToPlay.socket);

        // Vérifie qu'il n'y a pas de vainqueur
        if(this.players.length == 1){
            this.end(io);
        }

        // Regarde si ça fait 2 tour qu'on a les lettres
        if(this.nbTurnWithLetters == 2){
            this.nbTurnWithLetters = 1;
            this.letters = "";
            this.addLetters();
            io.to(this.idRoom).emit('show letters', this.letters);
        }
        else {
            this.nbTurnWithLetters++;
        }

        // Change le joueur actuel
        this.idPlayerToPlay++;
        this.idPlayerToPlay = this.idPlayerToPlay%this.players.length;
        this.playerToPlay = this.players[this.idPlayerToPlay];
    }

    pickLetters(lang = "fr", lettersTable = [], frequencyTable = []) {

        let latinCharsetTable = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        let frequencyTableFr = [7.8, 2, 4, 3.8, 11, 1.4, 3, 2.3, 8.6, 0.21, 0.97, 5.3, 2.7, 7.2, 6.1, 2.8, 0.19, 7.3, 8.7, 6.7, 3.3, 1, 0.91, 0.27, 1.6, 0.44];
    
        switch (lang) {
            case "fr":
                lettersTable = latinCharsetTable;
                frequencyTable = frequencyTableFr;
                break;
    
            default:
                if (!lettersTable || !frequencyTable) {
                    throw new Error("invalid charset or frequency table");
                }
                break;
        }
        
        let frequencyAccumulation = 0;
        let randomLetterProbability = Math.random() * 100;
        let letterIndex = 0;
        while (randomLetterProbability > frequencyAccumulation) {
            frequencyAccumulation += frequencyTable[letterIndex];
            letterIndex++;
        }
    
        return lettersTable[letterIndex - 1];
    }

    addLetters(){
        for(let i = 0; i < 3; i++){
            this.letters += this.pickLetters();
        }
    }

    removeLetters(){
        this.letters = '';
    }

    verifyWord(word){

        if(!word.includes(this.letters)){
            return false;
        }

        const content = this.dico.readFileSync('./server/ods6.txt', 'utf8');

        let lines = content.split('\n');
        for(let i = 0; i < lines.length; i++){
            if(word.toLowerCase() == lines[i].toLowerCase()){
                return true;
            }
        }

        return false;
    }

    exploseBomb(io, game){
        // Enlève une vie au player dont c'est le tour
        game.playerToPlay.loseLife();

        // Vérifie status du player
        if(game.playerToPlay.statut == 1){
            game.playerDied(game.playerToPlay.socket);
            io.to(game.idRoom).emit('player died', game.playerToPlay.username);
        }

        // Change le joueur dont c'est le tour
        game.nextTurn(io);

        if(game.hasBegun) {
            io.to(game.idRoom).emit('play', game.playerToPlay.socket, game.playerToPlay.username);
            game.bomb.initTime(io, game);
        }
    }


    begin(){
        // Remet tous les joueurs dead dans la liste des joueurs
        for(let i = 0; i < this.deadPlayers.length; i++){
            this.players.push(this.deadPlayers[i]);
        }
        this.deadPlayers = [];

        // Reset les stats des joueurs
        for(let i = 0; i < this.players.length; i++){
            this.players[i].reset();
        }

        // Vérifie que le nombre de joueur est suffisant
        if(this.players.length == 0 || this.players.length == 1){
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

    end(io){
        this.hasBegun = false;
        io.to(this.idRoom).emit('end game');
    }
}

module.exports = Game;