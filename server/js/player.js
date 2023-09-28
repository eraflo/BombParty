class Player {
    constructor(username, socket){
        this.username = username;
        this.socket = socket.id;
        this.lives = 2;
        this.statut = 0;
    }

    loseLife(){
        if(this.lives > 0){
            this.lives--;
        }
        if(this.lives === 0){
            this.statut = 1;
        }
    }

    reset() {
        this.lives = 2;
        this.statut = 0;
    }
}

module.exports = Player;