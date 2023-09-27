class Game {
    constructor(idRoom){
        this.idRoom = idRoom;
        this.players = [];
        this.idPlayerToPlay = 0;
        this.playerToPlay = null;
        this.letters = "";
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

    nextTurn(){
        this.idPlayerToPlay++;
        this.idPlayerToPlay = this.idPlayerToPlay%this.players.length;
        this.playerToPlay = this.players[this.idPlayerToPlay];
    }

    addLetters(letters){
        this.letters += letters;
    }

    removeLetters(){
        this.letters = '';
    }

    begin(){
        // Assigne un joueur au hasard pour commencer
        this.idPlayerToPlay = Math.floor(Math.random() * this.players.length);
        this.playerToPlay = this.players[this.idPlayerToPlay];
    }
}

module.exports = Game;