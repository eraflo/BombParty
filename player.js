class Player {
    constructor(username, socket){
        this.username = username;
        this.socket = socket.id;
        this.lives = 2;
    }
}

module.exports = Player;