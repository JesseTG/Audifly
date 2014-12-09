/*
 * This class serves as a player for the
 * Audifly application that plays mp3 files.
 */
function AudiflyMp3Player() {
    // FIRST INITIALIZE CONSTANTS WE'LL USE
    this.STOPPED = 0;
    this.PLAYING = 1;
    this.PAUSED = 2;
    this.timer = null;

    // FOR TESTING THE CURRENT STATE OF THE PLAYER
    this.isPaused  = function() { return this.playerState === this.PAUSED;  };
    this.isPlaying = function() { return this.playerState === this.PLAYING; };
    this.isStopped = function() { return this.playerState === this.STOPPED; };

    /*
     * Mutator method for setting the renderer 
     * attached to this player. It will receive
     * notifications of all mp3 music events
     * so that it may render a response.
     */
    this.setRenderer = function (initRenderer) {
        this.renderer = initRenderer;
    };

    /*
     * Initializes this player with its
     * initial state.
     */
    this.initDefaults = function () {
        this.playerState = this.STOPPED;
    };

    // INIT THE DEFAULT SETTINGS
    this.initDefaults();

    // INIT WEB AUDIO
    this.audioContext = new AudioContext();

    /*
     * This function loads and plays songscape, which
     * references an mp3 file.
     */
    this.loadAndPlaySongscape = function (songscape) {
        var request = new XMLHttpRequest();
        request.open('GET', songscape.songFilePath, true);
        request.responseType = 'arraybuffer';
        var player = this;
        request.onload = function () {
            player.audio = new Audio();
            player.audio.src = songscape.songFilePath;
            player.audio.controls = false;
            player.audio.autoplay = false;
            player.mp3Source = player.audioContext.createMediaElementSource(player.audio);
            player.analyser = player.audioContext.createAnalyser();
            player.analyser.smoothingTimeConstant = .85;
            player.mp3Source.connect(player.analyser);
            player.analyser.connect(player.audioContext.destination);
            songscape.renderer.initMp3();

            // THEN INITIALIZE THE ANALYSER ARRAYS
            player.frequencyData = new Uint8Array(player.analyser.frequencyBinCount);
            player.timeDomainData = new Uint8Array(player.analyser.frequencyBinCount);
            player.timer = setInterval(function() {
                if (player.isPlaying())                        
                {
                    player.analyser.getByteFrequencyData(player.frequencyData);        
                    player.analyser.getByteTimeDomainData(player.timeDomainData);
                    player.renderer.stepMp3(player.frequencyData, player.timeDomainData);
                }
            }, 33);
            player.play();
            }, function (error) {
                console.log(error);
        };
        request.send();
    };


    // STOP THE SONGSCAPE
    this.stop = function() {
        if (this.isPlaying() || this.isPaused())
        {
            this.audio.pause();
            clearInterval(this.timer);
            this.playerState = this.STOPPED;
        }
    };
    
    // PLAY THE SONGSCAPE
    this.play = function () {
        this.audio.play();
        this.playerState = this.PLAYING;
    };

    // PAUSE THE SONGSCAPE
    this.pause = function() {
        this.audio.pause();
        this.playerState = this.PAUSED;
    };
}