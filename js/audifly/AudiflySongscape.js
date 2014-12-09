/*
 * AudiflySongscape stores all the information
 * for a single songscape needed to play and
 * render it.
 */
function AudiflySongscape(  initName,
                            initSongFilePath,
                            initArtist,
                            initPlayer,
                            initRenderer) {
    this.name = initName;
    this.songFilePath = initSongFilePath;
    this.artist = initArtist;
    this.key = initName + " by " + initArtist;
    this.player = initPlayer;
    this.player.setRenderer(initRenderer);
    this.renderer = initRenderer;
}