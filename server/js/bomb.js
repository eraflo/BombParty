class Bomb {
    constructor() {
        this.time = null;
    }

    initTime(io, game) {
        this.time = Math.floor(Math.random() * 6) + 7;
        this.initCountdown(io, game);
    }

    initCountdown(io, game) {
        let interval = setInterval(() => {
            this.time--;
            if (this.time <= 0) {
                clearInterval(interval);
                this.time = null;
                game.exploseBomb(io, game);
            }
        }, 1000);
    }

    increaseTime() {
        this.time += 2;
    }
}

module.exports = Bomb;