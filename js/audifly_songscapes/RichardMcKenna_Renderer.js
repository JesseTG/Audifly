/*
 * This NoteToPlay object stores rendering information
 * for a note that is still renderable.
 */
function NoteToPlay(initX, initY, initW, initH, initR, initG, initB, initA) {
    this.timeRemaining;
    this.x = initX;
    this.y = initY;
    this.w = initW;
    this.h = initH;
    this.r = initR;
    this.g = initG;
    this.b = initB;
    this.a = initA;
}

/*
 * This is renderer for both MP3 and MIDI music
 * files for the Audifly application.
 */
function RichardMcKenna_Renderer(initCanvas, context) {
    this.canvas = initCanvas;
    this.graphicsContext = context;

    /*
     * This initializes rendering for the loaded MIDI
     * songscape.
     */
    this.initMIDI = function () {
        this.notes = [];
        this.bgColor0MAX = 160;
        this.bgColor0MIN = 120;
        this.bgColor0 = this.bgColor0MIN;
        this.bgInc = 40;
        this.bgIsIncreasing = true;
        this.ALPHA_INC = 1;
        this.Y_VELOCITY = 5;
    };

    /*
     * This method is called each time a note is played
     * and provides a rendered response.
     */
    this.stepMIDI = function (now,end,channel,message,note,velocity) {
        // UPDATE THE RENDERING INFO
        var xInc = this.canvas.width/16;
        var noteInc = this.canvas.height/128;
        var x = (xInc * channel) + (xInc/2);
        var y = this.canvas.height - (noteInc * note);
        var w = xInc;
        var h = noteInc;
        var r = 0;
        var g = (127 - note) * 2;
        var b = (channel*16)-1;
        var a = 255;
        
        // MAKE A NOTE
        var newNote = new NoteToPlay(x, y, w, h, r, g, b, a);
        this.notes.push(newNote);
        
        // AND REDRAW EVERYTHING
        this.midiDraw();
    };

    /*
     * We'll gradually change the background color, so
     * this method will update it's color gradient.
     */
    this.updateMidiBGColors = function() {
        // FIRST THE TOP LEFT COLOR
        if (this.bgIsIncreasing)
        {
            this.bgColor0++;
            if (this.bgColor0 >= this.bgColor0MAX)
                this.bgIsIncreasing = false;
        }
        else
        {
            this.bgColor0--;
            if (this.bgColor0 <= this.bgColor0MIN)
                this.bgIsIncreasing = true;
        }
    };

    /*
     * This function renders a frame for 
     * the MIDI file being played.
     */
    this.midiDraw = function() {
        // RENDER THE BACKGROUND GRADIENT
        var grd = this.graphicsContext.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        grd.addColorStop(0, "rgb(" + this.bgColor0 + "," + this.bgColor0 + "," + this.bgColor0 + ")");
        grd.addColorStop(1, "rgb(" + this.bgColor0+this.bgInc + "," + this.bgColor0+this.bgInc + "," + this.bgColor0+this.bgInc + ")");
        this.graphicsContext.fillStyle = grd;
        this.graphicsContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateMidiBGColors();
        
        // AND NOW THE NOTES
        var tempNotes = new Array();
        for (var i = 0; i < this.notes.length; i++)
        { 
            var note = this.notes[i];
            
            // DRAW A FILLED CIRCLE
            this.graphicsContext.fillStyle = "rgba(" + note.r + "," + note.g + "," + note.b + "," + note.a + ")";
            this.graphicsContext.beginPath();
            this.graphicsContext.arc(note.x, note.y, note.w/2, 0, 2*Math.PI);
            this.graphicsContext.fill();
            note.a -= this.ALPHA_INC;
            note.y += this.Y_VELOCITY;    
            if (note.y < this.canvas.height)
                tempNotes.push(note);
        }
        this.notes = tempNotes;
    };

    /*
     * This is called once when an mp3 soundscape
     * is first loaded.
     */
    this.initMp3 = function () {
        this.changingColorChannelValue = 0;
        this.colorInc = true;
        this.colorToInc = this.RED;
        this.RED = 0;
        this.GREEN = 1;
        this.BLUE = 2;
        this.backgroundRed = 0;
        this.backgroundGreen = 0;
        this.backgroundBlue = 0;
        this.colorToInc = this.RED;
    };

    /*
     * This function is called each frame while
     * a mp3 sondscape is being played.
     */
    this.stepMp3 = function (frequencyData, timeDomainData) {
        // RENDER THE BACKGROUND
        this.graphicsContext.fillStyle = this.generateBackgroundColor();
        this.graphicsContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // GET THE REST OF THE RENDERING DATA
        var binCount = frequencyData.length;
        var wInc = this.canvas.width / binCount;
        var hInc = this.canvas.height / 256;
        var gInc = 256 / binCount;
        var g = 255.0;
        var x = 0;
        
        // AND NOW RENDER EACH BIN COLUMN
        for (var i = 0; i < binCount; i++) {
            // NOW USE IT TO RENDER SOMETHING
            var h = hInc * frequencyData[i];
            this.graphicsContext.fillStyle =
                    "rgba(" + Math.round(g) + ","
                    + Math.round(g) + ",0,255)";
            this.graphicsContext.fillRect(x, 0, Math.ceil(wInc), h);
            x += wInc;
            g -= gInc;
            if (g < 0)
                g = 0;
        }
    };

    /*
     * This updates our mp3 rendering background
     * color.
     */
    this.generateBackgroundColor = function () {
        if (this.colorInc) {
            this.changingColorChannelValue++;
            if (this.changingColorChannelValue >= 255)
                this.colorInc = false;
        }
        else {
            this.changingColorChannelValue--;
            if (this.changingColorChannelValue <= 0)
            {
                // REVERSE IT
                this.colorInc = true;

                // PICK ANOTHER COLOR TO CHANGE
                this.colorToInc = Math.floor(Math.random() * 3);                
            }
        }
        // NOW ASSIGN THE PROPER COLORS
        this.backgroundRed = 0;
        this.backgroundGreen = 0;
        this.backgroundBlue = 0;
        if (this.colorToInc === this.RED) this.backgroundRed = this.changingColorChannelValue;
        else if (this.colorToInc === this.GREEN) this.backgroundGreen = this.changingColorChannelValue;
        else this.backgroundBlue = this.changingColorChannelValue;
        return "rgb(" + this.backgroundRed
                + "," + this.backgroundGreen
                + "," + this.backgroundBlue
                + ")";
    };
}