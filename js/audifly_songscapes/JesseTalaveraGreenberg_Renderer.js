function JesseTalaveraGreenberg_Renderer(initCanvas, context) {
    /*
     * This NoteToPlay object stores rendering information
     * for a note that is still renderable.
     */
    function NoteToPlay(x, y, width, height, h, s, l, a, speed) {
        this.timeRemaining;
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.hue = h;
        this.s = s;
        this.l = l;
        this.a = a;

        var rand = (Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
        // ^ Approximates a normally-distributed number

        var angle = (rand * 5 + 270) * (Math.PI / 180);
        this.vx = speed * Math.cos(angle);
        this.vy = -speed * Math.sin(angle);

    }

    var self = this;
    var now;
    var end;
    self.canvas = initCanvas;
    self.graphicsContext = context;
    var widest_dim = Math.max(self.canvas.width, self.canvas.height);
    var min_dim = Math.min(self.canvas.width, self.canvas.height);
    var staffw = 4;
    var staffh = -32;

    /*
     * This initializes rendering for the loaded MIDI
     * songscape.
     */
    self.initMIDI = function() {
        self.notes = [];
        self.bgColor0MAX = 160;
        self.bgColor0MIN = 120;
        self.bgColor0 = self.bgColor0MIN;
        self.bgInc = 40;
        self.bgIsIncreasing = true;
        self.ALPHA_INC = -self.canvas.height / 128;
        self.Y_VELOCITY = 5;
    };

    /*
     * This method is called each time a note is played
     * and provides a rendered response.
     */
    self.stepMIDI = function(now, end, channel, message, note, velocity) {
        // UPDATE THE RENDERING INFO
        var xInc = self.canvas.width / 128;

        self.now = now;
        self.end = end;

        var radius = xInc;
        var x = radius * note;
        var y = self.canvas.height - (self.canvas.height * (self.now / self.end));
        var h = channel * (360 / 16);
        var s = 100;
        var l = note;
        var a = 0;

        // MAKE A NOTE
        var newNote = new NoteToPlay(x, y, radius, radius, h, s, l, a, self.Y_VELOCITY);
        self.notes.push(newNote);
    };

    /*
     * This function renders a frame for
     * the MIDI file being played.
     */
    self.midiDraw = function() {
        var gfx = self.graphicsContext;

        var radial = widest_dim - (self.now / self.end) * (min_dim / 4);

        // RENDER THE BACKGROUND GRADIENT
        var grd = gfx.createRadialGradient(
            self.canvas.width / 2,
            self.canvas.height / 2,
            radial,
            self.canvas.width / 2,
            self.canvas.height / 2,
            radial / 8
        );

        var ca = Math.round((self.now / self.end) * 255);
        var cb = 255 - ca;

        grd.addColorStop(0, 'rgb(' + ca + ',' + ca + ',' + ca + ')');
        grd.addColorStop(1, 'rgb(' + cb + ',' + cb + ',' + cb + ')');
        gfx.fillStyle = grd;
        gfx.fillRect(0, 0, self.canvas.width, self.canvas.height);

        // AND NOW THE NOTES
        var tempNotes = [];
        for (var i = 0; i < self.notes.length; ++i) {
            var note = self.notes[i];

            gfx.fillStyle = "hsla(" + note.hue + "," + note.s + "%," + note.l + "%, " + (note.a / 255) + ")";
            gfx.beginPath();
            gfx.arc(note.x, note.y, note.w / 2, 0, Math.PI * .5, true);
            gfx.rect(note.x + note.w / 2 - staffw, note.y, staffw, staffh);
            gfx.fill();
            gfx.closePath();

            note.a -= self.ALPHA_INC;
            note.x += note.vx;
            note.y += note.vy;
            if (note.y + staffh < self.canvas.height && note.y > 0 && note.x > 0 && note.x < self.canvas.width)
                tempNotes.push(note);
        }

        gfx.fillStyle = '#00aa00';
        gfx.fillRect(0, self.canvas.height - (self.canvas.height * (self.now / self.end)), self.canvas.width, 4);

        self.notes = tempNotes;

        if (self.shouldRender) {
            requestAnimationFrame(self.midiDraw);
        }
    };

    /*
     * This is called once when an mp3 soundscape
     * is first loaded.
     */
    self.initMp3 = function() {
        self.changingColorChannelValue = 0;
        self.colorInc = true;
        self.colorToInc = self.RED;
        self.RED = 0;
        self.GREEN = 1;
        self.BLUE = 2;
        self.backgroundRed = 0;
        self.backgroundGreen = 0;
        self.backgroundBlue = 0;
        self.colorToInc = self.RED;

        self.ground = [];
        self.ceiling = [];
        self.tempTimeAvg = new Array(1024);
        self.tempFreqAvg = new Array(1024);

        self.shipCanvas = document.createElement('canvas');
        self.shipCanvas.width = 32;
        self.shipCanvas.height = 24;

        var shipContext = self.shipCanvas.getContext('2d');
        shipContext.strokeStyle = 'white';
        shipContext.beginPath();
        shipContext.moveTo(6, 0);
        shipContext.lineTo(8, 0);
        shipContext.lineTo(12, 12);
        shipContext.lineTo(8, 24);
        shipContext.lineTo(6, 24);
        shipContext.lineTo(0, 6);
        shipContext.lineTo(32, 12);
        shipContext.lineTo(0, 18);
        shipContext.closePath();
        shipContext.stroke();

        self.ship = {
            x: self.canvas.width / 2,
            y: self.canvas.height / 2
        };

        var red = 'rgba(255,0,0,.4)';
        var yellow = 'rgba(255,255,0,.4)';
        var green = 'rgba(0,255,0,.4)';
        self.overlay = self.graphicsContext.createLinearGradient(0, 0, 0, self.canvas.height);
        self.overlay.addColorStop(.20, red);
        self.overlay.addColorStop(.25, yellow);
        self.overlay.addColorStop(.75, yellow);
        self.overlay.addColorStop(.8, green);
        self.overlay.addColorStop(1, green);
    };

    var sum = function(a, b) {
        return a + b;
    };

    /*
     * This function is called each frame while
     * a mp3 sondscape is being played.
     */
    self.stepMp3 = function(frequencyData, timeDomainData) {
        for (var i = 0; i < self.tempTimeAvg.length; ++i) {
            self.tempFreqAvg[i] = frequencyData[i];
            self.tempTimeAvg[i] = timeDomainData[i];
        }

        var timeAvg = self.tempTimeAvg.reduce(sum) / self.tempTimeAvg.length;
        self.ceiling.push(timeAvg);

        var freqAvg = self.tempFreqAvg.reduce(sum) / self.tempFreqAvg.length;
        self.ground.push(freqAvg);

        var gfx = self.graphicsContext;

        // RENDER THE BACKGROUND
        this.graphicsContext.fillStyle = '#000'; //this.generateBackgroundColor();
        this.graphicsContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // GET THE REST OF THE RENDERING DATA
        var binCount = frequencyData.length;
        var wInc = self.canvas.width / binCount;
        var hInc = self.canvas.height / 256;

        var lastAvgTime = self.ceiling.length >= 2 ? self.ceiling[self.ceiling.length - 2] : 0;
        var diff = timeAvg - lastAvgTime;

        self.ship.y = self.canvas.height/2 - freqAvg * hInc * .25;

        gfx.moveTo(0, self.canvas.height - timeDomainData[0]);
        gfx.beginPath();

        gfx.strokeStyle = "red";
        for (var i = 0; i < binCount; ++i) {
            var t = timeDomainData[i];
            var x = i * wInc;
            var y = self.canvas.height - t * hInc;
            gfx.lineTo(x, y);
        }
        gfx.stroke();

        gfx.moveTo(self.canvas.width - self.ground.length, self.canvas.height);
        gfx.beginPath();
        gfx.strokeStyle = 'white';
        for (var i = 0; i < self.ground.length; ++i) {
            var g = self.ground[i];
            var x = i + self.canvas.width - self.ground.length;
            var y = self.canvas.height - g;
            gfx.lineTo(x, y);
        }

        gfx.moveTo(self.canvas.width - self.ceiling.length, 0);
        for (var i = 0; i < self.ceiling.length; ++i) {
            var c = self.ceiling[i];
            var x = i + self.canvas.width - self.ground.length;
            var y = hInc * (c - 96);
            gfx.lineTo(x, y);
        }
        gfx.stroke();

        gfx.drawImage(self.shipCanvas, self.ship.x, self.ship.y);

        gfx.fillStyle = self.overlay;
        gfx.fillRect(0, 0, self.canvas.width, self.canvas.height);
    };
}
