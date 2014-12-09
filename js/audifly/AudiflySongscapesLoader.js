/*
 * This object does all the songscape loading
 * for the Audifly app. It loads all data from
 * the AudiflySongscapeList.json file as songscapes
 * into the app.
 */
function AudiflySongscapesLoader() {
    /*
     * This function lets us dynamically add
     * javascript files which will serve as
     * our renderers.
     */
    this.loadSongscapeJavaScript = function (javascriptFile) {
        javascriptFile = "./js/audifly_songscapes/" + javascriptFile;
        var scriptToAdd = $("<script type='text/javascript' src='" + javascriptFile + "'>");
        var headElement = $("head");
        headElement.append(scriptToAdd);
    };
    
    /*
     * This funtion initializes a songscape using the
     * provided arguments and adds it to the list of
     * loaded songscapes.
     */
    this.initSongscape = function (title, author, file, player, renderer) {
        var songscape = new AudiflySongscape(title, author, file, player, renderer);
        this.songscapes.push(songscape);
    };

    /*
     * This function loads all the songscapes into
     * the Audifly app.
     */
    this.initSongscapes = function (audifly, callback) {
        // FIRST MAKE THE ARRAY TO STORE THEM
        this.songscapes = [];

        // THEN ADD ALL THE SONGSCAPES
        var songscapeListFile = "./js/audifly_songscapes/AudiflySongscapeList.json";
        this.loadSongscapes(audifly, songscapeListFile, callback);
    };
    
    /*
     * This function does the work of loading the .json
     * file and extracting the information to initialize
     * the songscapes.
     */
    this.loadSongscapes = function(audifly, fileName, callback) {
        var xmlhttp = new XMLHttpRequest();
        var loader = this;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var textArray = JSON.parse(xmlhttp.responseText);
                loader.loadTextArrayIntoSongscapes(audifly, textArray);
                callback();
            }
        };
        xmlhttp.open("GET", fileName, true);
        xmlhttp.send();
    };

    /*
     * This helper method assists in setting
     * up the loaded songscapes.
     */
    this.loadTextArrayIntoSongscapes = function(audifly, textArray) {
        // GET ALL THE DATA 
        var data = textArray.songscapesData;
        
        // WE'LL USE THESE TO MAKE SURE WE DON'T
        // REPEATEDLY LOAD THE SAME THING
        var jsToLoad = [];
        var renderers = [];
        
        // NOW LOAD ALL THE DATA
        for (var i = 0; i < data.length; i++) {
            var title = data[i].title;
            var fileName = data[i].fileName;
            fileName = "./media/" + fileName;
            var artist = data[i].artist;
            var playerName = data[i].playerType;
            var player = audifly[playerName];
            var rendererFile = data[i].rendererFile;
            this.loadSongscapeJavaScript(rendererFile);
            jsToLoad[rendererFile] = rendererFile;
            var rendKeys = Object.keys(renderers);
            var rendererName = data[i].renderer;
            var hasRenderer = renderers.hasOwnProperty(rendererName);
            if (!hasRenderer) {
                renderers[rendererName] = new (window[rendererName])(audifly.canvas, audifly.context);
            }
            var renderer = renderers[rendererName];
            var songscape = new AudiflySongscape(
                    title, fileName, artist, player, renderer);
            this.songscapes.push(songscape);
        }
        // NOW LOAD ALL THE PLUGINS
        var keys = Object.keys(jsToLoad);
        var numJSFiles = keys.length;
        for (var i = 0; i < numJSFiles; i++) {
            this.loadSongscapeJavaScript(keys[i]);
        }
    };
}