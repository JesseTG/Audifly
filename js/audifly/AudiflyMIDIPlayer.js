/*
 * This class serves as a player for the
 * Audifly application that plays MIDI files.
 */
function AudiflyMIDIPlayer() {
    // FIRST INITIALIZE CONSTANTS WE'LL USE
    this.STOPPED = 0;
    this.PLAYING = 1;
    this.PAUSED = 2;
    this.timer = null;

    // WE'RE DOING ALL GRAND PIANO, WHICH
    // IS NAMED "acoustic_grand" IN JFugue.
    // THIS COULD, OF COURSE, BE CHANGED
    MIDI.loader = new widgets.Loader;
    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instruments: ["acoustic_grand_piano"],
        callback: function () {
            MIDI.loader.stop();
        }
    });

    // FOR TESTING THE CURRENT STATE OF THE PLAYER
    this.isPaused = function () {
        return this.playerState === this.PAUSED;
    };
    this.isPlaying = function () {
        return this.playerState === this.PLAYING;
    };
    this.isStopped = function () {
        return this.playerState === this.STOPPED;
    };

    /*
     * Mutator method for setting the renderer 
     * attached to this player. It will receive
     * notifications of all MIDI music events
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

    /*
     * This function loads the songscape argument
     * and plays it.
     */
    this.loadAndPlaySongscape = function (songscape) {
        var player = this;
        MIDI.Player.loadFile(songscape.songFilePath, function (event) {
            MIDI.Player.addListener(function (data) {
                songscape.renderer.stepMIDI(
                        data.now, data.end, data.channel,
                        data.message, data.note, data.velocity);
            });
            songscape.renderer.initMIDI();
            player.play();
        });
    };

    /*
     * This function starts the loaded MIDI.
     */
    this.play = function () {
        MIDI.Player.start();
        this.playerState = this.PLAYING;
        this.renderer.shouldRender = true;
        requestAnimationFrame(this.renderer.midiDraw);
    };

    // STOP THE SONGSCAPE
    this.stop = function () {
        MIDI.Player.stop();
        this.renderer.shouldRender = false;
        this.playerState = this.STOP;
        //clearInterval(this.timer);
    };
    
    // PAUSE THE SONGSCAPE
    this.pause = function() {
        MIDI.Player.pause();
        this.renderer.shouldRender = false;
        this.playerState = this.PAUSED;
        //clearInterval(this.timer);
    }
}