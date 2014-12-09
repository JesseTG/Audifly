// THIS IS THE GLOBAL Audifly OBJECT
var audifly;

/* 
 * This is the Audifly definition, which runs our
 * application and responds to UI interactions.
 */
function Audifly(initCanvas) {
    // KEEP THE CANVAS FOR RENDERING
    this.canvas = initCanvas;
    this.context = this.canvas.getContext('2d');

    // WE MAY NEED BOTH AN MP3 PLAYER AND A MIDI PLAYER
    this.mp3Player = new AudiflyMp3Player();
    this.midiPlayer = new AudiflyMIDIPlayer();

    /*
     * This function delegates the initialization of
     * the songscapes to the AudiflySongscapesLoader.
     */
    this.initSongscapes = function(songscapesLoader) {
        var audifly = this;
        // WE'LL HANG ONTO THE ORIGINAL LIST IN CASE
        // THE USER WANTS TO RESET BACK TO THE ORIGINAL ONE
        songscapesLoader.initSongscapes(this, function() {
            audifly.originalSongscapes = songscapesLoader.songscapes;
            audifly.reset();
        });
    };

    /*
     * This function loads all of the songscapes
     * into the song selector control.
     */
    this.loadSongcapesIntoSelect = function() {
        var options = $("#song_selector option");
        for (var i = 0; i < options.length; i++)
            options[i].remove();

        // AND THEN PUT THEM IN THE COMBO BOX
        for (var i = 0; i < this.songscapes.length; i++) {
            $("#song_selector").append($('<option>', {
                value: i,
                text: this.songscapes[i].key
            }));
        }
    };

    /*
     * This function stops the current song being played.
     */
    this.stop = function() {
        var player = this.getCurrentSongscape().player;
        player.stop();
        $("#play_btn").addClass("glyphicon-play")
            .removeClass("glyphicon-pause");
    };

    /*
     * This function gets and returns the songscape
     * currently selected. Note that it may or may
     * not be currently playing.
     */
    this.getCurrentSongscape = function() {
        var index = this.getCurrentSongscapeIndex();
        return this.songscapes[index];
    }

    /*
     * This function gets and returns the index of
     * the songscape currently selected. Note that
     * it may or may not be currently playing.
     */
    this.getCurrentSongscapeIndex = function() {
        return $("#song_selector option:selected").index();
    };

    /*
     * This function toggles the play and pause
     * buttons, playing and pausing the loaded songscape.
     */
    this.playPause = function() {
        // FIRST GET THE CURRENT SONGSCAPE
        var currentSongScape = this.getCurrentSongscape();

        // THEN LOAD AND PLAY THE SONG
        var player = currentSongScape.player;

        // FIRST CHECK TO SEE IF A SONG IS PLAYING
        if (player.isPlaying()) {
            player.pause();

            $("#play_btn").addClass("glyphicon-play")
                .removeClass("glyphicon-pause");
        }
        // THEN CHECK TO SEE IF A SONG IS ALREADY LOADED
        // BUT IS PAUSED
        else if (player.isPaused()) {
            // CONTINUE THE SONG FROM WHERE IT WAS PAUSED
            player.play();
            $("#play_btn").addClass("glyphicon-pause")
                .removeClass("glyphicon-play");
        }
        // OTHERWISE WE HAVE TO LOAD THE SONG
        else {
            player.loadAndPlaySongscape(currentSongScape);
            $("#play_btn").addClass("glyphicon-pause")
                .removeClass("glyphicon-play");
        }
    };

    /*
     * This function serves to change the selected song
     * in the seletor control to either the next or previous
     * song.
     */
    this.nextPrev = function(next) {
        var selectedSongscape = this.getCurrentSongscape();
        var player = selectedSongscape.player;
        if (player.isPlaying()) {
            this.stop();
            this.incSelected(next);
            this.playPause();
        } else
            this.incSelected(next);
    };

    /*
     * This function updates the selected index by
     * either increasing it or decreasing it by one,
     * taking rollover into account.
     */
    this.incSelected = function(increasing) {
        var currentIndex = this.getCurrentSongscapeIndex();
        var incIndex = currentIndex;

        // RETRIEVE THE SONG SELECTOR ELEMENT
        var options = $("#song_selector option");
        var numOptions = options.length;
        if (increasing) {
            incIndex++;

            // INC THE OPTION
            if (incIndex >= numOptions)
                incIndex = 0
        } else {
            incIndex--;

            // INC THE OPTION
            if (incIndex < 0)
                incIndex = numOptions - 1;
        }
        options[incIndex].selected = true;
    };

    /*
     * This function randomizes the songscapes loaded
     * into the selector.
     */
    this.randomize = function() {
        var currentSongscape = this.getCurrentSongscape();
        var numSongs = this.songscapes.length;
        for (var i = 0; i < numSongs; i++) {
            // PICK A RANDOM INDEX
            var randomIndex = Math.floor(Math.random() * numSongs);

            // AND SWAP
            var temp = this.songscapes[randomIndex];
            this.songscapes[randomIndex] = this.songscapes[i];
            this.songscapes[i] = temp;
        }
        // NOW PUT THEM IN
        this.loadSongcapesIntoSelect();

        // IF ANOTHER SONG WAS PLAYING START
        // THE NEWLY SELECTED ONE
        if (currentSongscape.player.isPlaying()) {
            this.stop();
            this.playPause();
        } else if (currentSongscape.player.isPaused()) {
            this.stop();
            this.playPause();
            this.playPause();
        } else
            this.stop();
    };

    /*
     * This function resets the songscapes back to their
     * original order, as they were loaded.
     */
    this.reset = function() {
        var selectedIndex = this.getCurrentSongscapeIndex();
        var currentSongscape;
        if (selectedIndex != -1)
            currentSongscape = this.getCurrentSongscape();

        // AND NOW FILL THE ONE THAT WILL CHANGE SHOULD
        // THE USER SHUFFLE
        this.songscapes = [];
        for (var i = 0; i < this.originalSongscapes.length; i++)
            this.songscapes[i] = this.originalSongscapes[i];
        this.loadSongcapesIntoSelect();
        currentSongscape = this.songscapes[0];

        // IF ANOTHER SONG WAS PLAYING START
        // THE NEWLY SELECTED ONE
        if (currentSongscape.player.isPlaying()) {
            this.stop();
            this.playPause();
        } else if (currentSongscape.player.isPaused()) {
            this.stop();
            this.playPause();
            this.playPause();
        } else
            this.stop();
    };
}
