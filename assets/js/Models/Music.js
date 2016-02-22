var Music = function () {
    this.music = null;
    this.muted = false;

    this.mute = function () {
        this.music.volume = 0;
        this.muted = true;
    };

    this.unMute = function () {
        this.music.volume = .7;
        this.muted = false;
    };

    this.setMusic = function (music) {
        if (this.muted) {
            if (this.music) {
                this.music.volume = 0;
            }
            this.music = music;
        } else {
            if (this.music) {
                this.music.volume = 0;
            }
            this.music = music;
            this.music.volume = .7;
        }

    }

    this.again = function(){
        this.music.play();
    }
};