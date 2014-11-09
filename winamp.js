/* Helpful wrapper for the native <audio> element */
function Media (audioId) {
    this.audio = document.getElementById(audioId);

    /* Properties */
    this.timeElapsed = function() {
        return this.audio.currentTime;
    }
    this.timeRemaining = function() {
        return this.audio.duration - this.audio.currentTime;
    }
    this.timeElapsedObject = function() {
        return this._timeObject(this.timeElapsed());
    }
    this.timeRemainingObject = function() {
        return this._timeObject(this.timeRemaining());
    }
    this.percentComplete = function() {
        return (this.audio.currentTime / this.audio.duration) * 100;
    }

    this.showThings = function() {
        document.getElementById('khz').style.display = '';
        document.getElementById('kbps').style.display = '';
        document.getElementById('position').style.display = '';
        document.getElementById('time').style.display = '';
    };
    this.hideThings = function() {
        document.getElementById('khz').style.display = 'none';
        document.getElementById('kbps').style.display = 'none';
        document.getElementById('position').style.display = 'none';
        document.getElementById('time').style.display = 'none';
    };

    /* Actions */
    this.previous = function() {
        // Implement this when we support playlists
    };
    this.play = function() {
        self.showThings();
        this.audio.play();
        if(this.audio.currentTime = 0){}
    };
    this.pause = function() {
        this.audio.pause();
    };
    this.stop = function() {
        self.hideThings();
        this.audio.pause();
        this.audio.currentTime = 0;
    };
    this.next = function() {
        // Implement this when we support playlists
    };
    this.toggleRepeat = function() {
        this.audio.loop = !this.audio.loop;
    };
    this.toggleShuffle = function() {
        // Not implemented
    };

    /* Actions with arguments */
    this.seekToPercentComplete = function(percent) {
        this.audio.currentTime = this.audio.duration * (percent/100);
        this.audio.play();
    };
    // From 0-1
    this.setVolume = function(volume) {
        this.audio.volume = volume;
    };
    this.loadFile = function(file) {
        this.audio.setAttribute('src', file);
    };

    /* Listeners */
    this.addEventListener = function(event, callback) {
        this.audio.addEventListener(event, callback);
    };

    /* Helpers */
    this._timeObject = function(time) {
        var minutes = Math.floor(time / 60);
        var seconds = time - (minutes * 60);

        return [
            Math.floor(minutes / 10),
            Math.floor(minutes % 10),
            Math.floor(seconds / 10),
            Math.floor(seconds % 10)
        ];
    }
}

function Winamp () {
    self = this;
    this.media = new Media('player');
    this.font = new Font();

    this.nodes = {
        'option': document.getElementById('option'),
        'close': document.getElementById('close'),
        'shade': document.getElementById('shade'),
        'position': document.getElementById('position'),
        'fileInput': document.getElementById('file-input'),
        'volumeMessage': document.getElementById('volume-message'),
        'balanceMessage': document.getElementById('balance-message'),
        'songTitle': document.getElementById('song-title'),
        'time': document.getElementById('time'),
        'shadeTime': document.getElementById('shade-time'),
        'previous': document.getElementById('previous'),
        'play': document.getElementById('play'),
        'pause': document.getElementById('pause'),
        'stop': document.getElementById('stop'),
        'next': document.getElementById('next'),
        'eject': document.getElementById('eject'),
        'repeat': document.getElementById('repeat'),
        'shuffle': document.getElementById('shuffle'),
        'volume': document.getElementById('volume'),
        'balance': document.getElementById('balance'),
        'playPause': document.getElementById('play-pause'),
        'workIndicator': document.getElementById('work-indicator'),
        'winamp': document.getElementById('winamp'),
        'titleBar': document.getElementById('title-bar')
    };

    this.showThings = function() {
        document.getElementById('khz').style.display = '';
        document.getElementById('kbps').style.display = '';
        document.getElementById('position').style.display = '';
        document.getElementById('time').style.display = '';
    };

    this.hideThings = function() {
        document.getElementById('khz').style.display = 'none';
        document.getElementById('kbps').style.display = 'none';
        document.getElementById('position').style.display = 'none';
        document.getElementById('time').style.display = 'none';
    };

    // make window dragable
    this.nodes.titleBar.addEventListener('mousedown',function(e){
        if(e.target !== this) {
            // prevent going into drag mode when clicking any of the title bar's icons
            // by making sure the click was made directly on the titlebar
            return true;
        }

        // get starting window position
        var winampElm = self.nodes.winamp;

        // if the element was 'absolutely' positioned we could simply use offsetLeft / offsetTop
        // however the element is 'relatively' positioned so we're using style.left
        // parseInt is used to remove the 'px' postfix from the value

        var winStartLeft = parseInt(winampElm.style.left || 0,10),
            winStartTop  = parseInt(winampElm.style.top || 0,10);

        // get starting mouse position
        var mouseStartLeft = e.clientX,
            mouseStartTop = e.clientY;

        // mouse move handler function while mouse is down
        function handleMove(e) {
            // get current mouse position
            var mouseLeft = e.clientX,
                mouseTop = e.clientY;

            // calculate difference offsets
            var diffLeft = mouseLeft-mouseStartLeft,
                diffTop = mouseTop-mouseStartTop;

            // move window to new position
            winampElm.style.left = (winStartLeft+diffLeft)+"px";
            winampElm.style.top = (winStartTop+diffTop)+"px";
        }

        // mouse button up
        function handleUp() {
            removeListeners();
        }

        function removeListeners() {
            window.removeEventListener('mousemove',handleMove);
            window.removeEventListener('mouseup',handleUp);
        }

        window.addEventListener('mousemove',handleMove);
        window.addEventListener('mouseup',handleUp);
    });

    this.nodes.option.onclick = function() {
        text = "Enter an Internet location to open here:\n";
        text += "For example: http://www.server.com/file.mp3"
        file = window.prompt(text, '');
        if(file != null) {
            self.startFile(file, file);
            self.media.play();
            self.setStatus('play');
        }
    }

    this.nodes.close.onclick = function() {
        self.media.stop();
        self.setStatus('stop'); // Currently unneeded
        self.nodes.winamp.classList.add('closed');
    }

    this.media.addEventListener('timeupdate', function() {
        self.nodes.position.value = self.media.percentComplete();
        self.updateTime();
    });

    this.media.addEventListener('ended', function() {
        self.hideThings();
        self.setStatus('stop');
    });

    this.media.addEventListener('waiting', function() {
        self.nodes.workIndicator.classList.add('selected');
    });

    this.media.addEventListener('playing', function() {
        self.nodes.workIndicator.classList.remove('selected');
    });

    this.nodes.shade.onclick = function() {
        self.nodes.winamp.classList.toggle('shade');
    }

    this.nodes.time.onclick = function() {
        this.classList.toggle('countdown');
        self.updateTime();
    }

    this.nodes.shadeTime.onclick = function() {
        self.nodes.time.classList.toggle('countdown');
        self.updateTime();
    }

    this.nodes.previous.onclick = function() {
        // Implement this when we support playlists
    }

    this.nodes.play.onclick = function() {
        self.media.play();
        self.setStatus('play');
    }
    this.nodes.pause.onclick = function() {
        self.media.pause();
        self.setStatus('pause');
    }
    this.nodes.stop.onclick = function() {
        self.media.stop();
        self.setStatus('stop');
    }
    this.nodes.next.onclick = function() {
        // Implement this when we support playlists
    }

    this.nodes.eject.onclick = function() {
        self.nodes.fileInput.click();
    }

    this.nodes.fileInput.onchange = function(e){
        var file = e.target.files[0];
        if(file) {
            self.startFileViaReference(file);
        }
    }

    this.nodes.volume.onmousedown = function() {
        self.nodes.winamp.classList.add('setting-volume');
    }
    this.nodes.volume.onmouseup = function() {
        self.nodes.winamp.classList.remove('setting-volume');
    }

    this.nodes.volume.oninput = function() {
        self.setVolume(this.value);
    }

    this.nodes.position.onmousedown = function() {
        self.media.pause();
    }

    this.nodes.position.onchange = function() {
        self.media.seekToPercentComplete(this.value);
    }

    this.nodes.balance.onmousedown = function() {
        self.nodes.winamp.classList.add('setting-balance');
    }
    this.nodes.balance.onmouseup = function() {
        self.nodes.winamp.classList.remove('setting-balance');
    }
    this.nodes.balance.oninput = function() {
        self.setBalance(this.value);
    }
    this.nodes.repeat.onclick = function() {
        toggleRepeat();
    }
    this.nodes.shuffle.onclick = function() {
        toggleShuffle();
    }

    this.setStatus = function(className) {
        self.nodes.playPause.removeAttribute("class");
        self.nodes.playPause.classList.add(className);
    }
    // From 0-100
    this.setVolume = function(volume) {
        var percent = volume / 100;
        sprite = Math.round(percent * 28);
        offset = (sprite - 1) * 15;

        self.media.setVolume(percent);
        self.nodes.volume.style.backgroundPosition = '0 -' + offset + 'px';

        string = 'Volume: ' + volume + '%';
        self.font.setNodeToString(self.nodes.volumeMessage, string);

        // This shouldn't trigger an infinite loop with volume.onchange(),
        // since the value will be the same
        self.nodes.volume.value = volume;
    }

    this.setBalance = function(balance) {
        var string = '';
        if(balance == 0) {
            string = 'Balance: Center';
        } else if(balance > 0) {
            string = 'Balance: ' + balance + '% Right';
        } else {
            string = 'Balance: ' + Math.abs(balance) + '% Left';
        }
        self.font.setNodeToString(self.nodes.balanceMessage, string);

        balance = Math.abs(balance) / 100
        sprite = Math.round(balance * 28);
        offset = (sprite - 1) * 15;
        self.nodes.balance.style.backgroundPosition = '-9px -' + offset + 'px';
    }

    function toggleRepeat() {
        self.media.toggleRepeat();
        self.nodes.repeat.classList.toggle('selected');
    }

    function toggleShuffle() {
        self.media.toggleShuffle();
        self.nodes.shuffle.classList.toggle('selected');
    }

    // TODO: Refactor this function
    this.updateTime = function() {
        self.updateShadePositionClass();

        var shadeMinusCharacter = ' ';
        if(this.nodes.time.classList.contains('countdown')) {
            digits = this.media.timeRemainingObject();
            var shadeMinusCharacter = '-';
        } else {
            digits = this.media.timeElapsedObject();
        }
        this.font.displayCharacterInNode(shadeMinusCharacter, document.getElementById('shade-minus-sign'));

        html = digitHtml(digits[0]);
        document.getElementById('minute-first-digit').innerHTML = '';
        document.getElementById('minute-first-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[0], document.getElementById('shade-minute-first-digit'));
        html = digitHtml(digits[1]);
        document.getElementById('minute-second-digit').innerHTML = '';
        document.getElementById('minute-second-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[1], document.getElementById('shade-minute-second-digit'));
        html = digitHtml(digits[2]);
        document.getElementById('second-first-digit').innerHTML = '';
        document.getElementById('second-first-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[2], document.getElementById('shade-second-first-digit'));
        html = digitHtml(digits[3]);
        document.getElementById('second-second-digit').innerHTML = '';
        document.getElementById('second-second-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[3], document.getElementById('shade-second-second-digit'));
    }

    // In shade mode, the position slider shows up differently depending on if
    // it's near the start, middle or end of its progress
    this.updateShadePositionClass = function() {
        self.nodes.position.removeAttribute("class");
        if(self.nodes.position.value <= 33) {
            self.nodes.position.classList.add('left');
        } else if(self.nodes.position.value >= 66) {
            self.nodes.position.classList.add('right');
        }
    }

    this.dragenter = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    this.dragover = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    this.drop = function(e) {
        e.stopPropagation();
        e.preventDefault();
        var dt = e.dataTransfer;
        var file = dt.files[0];
        self.startFileViaReference(file);
    }

    this.nodes.winamp.addEventListener('dragenter', this.dragenter);
    this.nodes.winamp.addEventListener('dragover', this.dragover);
    this.nodes.winamp.addEventListener('drop', this.drop);

    this.startFileViaReference = function(fileReference) {
        var objectUrl = URL.createObjectURL(fileReference);
        self.startFile(objectUrl, fileReference.name);
    }

    this.startFile = function(file, fileName) {
        self.loadFile(file, fileName);
        self.media.play();
        self.setStatus('play');
    }

    this.loadFile = function(file, fileName) {
        this.media.loadFile(file);
        this.font.setNodeToString(document.getElementById('song-title'), fileName)
        this.font.setNodeToString(document.getElementById('kbps'), "128")
        this.font.setNodeToString(document.getElementById('khz'), "44")
        this.updateTime();
    }

    function digitHtml(digit) {
        horizontalOffset = digit * 9;
        div = document.createElement('div');
        div.classList.add('digit');
        div.style.backgroundPosition = '-' + horizontalOffset + 'px 0';
        div.innerHTML = digit;
        return div;
    }

}

Font = function() {

    this.setNodeToString = function(node, string) {
        stringElement = this.stringNode(string);
        node.innerHTML = '';
        node.appendChild(stringElement);
    }

    this.stringNode = function(string) {
        parentDiv = document.createElement('div');
        for (var i = 0, len = string.length; i < len; i++) {
            char = string[i].toLowerCase();
            parentDiv.appendChild(this.characterNode(char));
        }
        return parentDiv;
    }

    this.characterNode = function(char) {
        return this.displayCharacterInNode(char, document.createElement('div'));
    }

    this.displayCharacterInNode = function(character, node) {
        position = this.charPosition(character);
        row = position[0];
        column = position[1];
        verticalOffset = row * 6;
        horizontalOffset = column * 5;

        x = '-' + horizontalOffset + 'px';
        y = '-' + verticalOffset + 'px'
        node.style.backgroundPosition =  x + ' ' + y;
        node.classList.add('character');
        node.innerHTML = character;
        return node;
    }

    this.charPosition = function(char) {
        position = this.fontLookup[char];
        if(!position) {
            return this.fontLookup[' '];
        }

        return position;
    }

    /* XXX There are too many " " and "_" characters */
    this.fontLookup = {
        "a": [0,0], "b": [0,1], "c": [0,2], "d": [0,3], "e": [0,4], "f": [0,5],
        "g": [0,6], "h": [0,7], "i": [0,8], "j": [0,9], "k": [0,10],
        "l": [0,11], "m": [0,12], "n": [0,13], "o": [0,14], "p": [0,15],
        "q": [0,16], "r": [0,17], "s": [0,18], "t": [0,19], "u": [0,20],
        "v": [0,21], "w": [0,22], "x": [0,23], "y": [0,24], "z": [0,25],
        "\"": [0,26], "@": [0,27], " ": [0,29], "0": [1,0], "1": [1,1],
        "2": [1,2], "3": [1,3], "4": [1,4], "5": [1,5], "6": [1,6], "7": [1,7],
        "8": [1,8], "9": [1,9], " ": [1,10], "_": [1,11], ":": [1,12],
        "(": [1,13], ")": [1,14], "-": [1,15], "'": [1,16], "!": [1,17],
        "_": [1,18], "+": [1,19], "\\": [1,20], "/": [1,21], "[": [1,22],
        "]": [1,23], "^": [1,24], "&": [1,25], "%": [1,26], ".": [1,27],
        "=": [1,28], "$": [1,29], "#": [1,30], "Å": [2,0], "Ö": [2,1],
        "Ä": [2,2], "?": [2,3], "*": [2,4], " ": [2,5]
    };
}

keylog = [];
trigger = [78,85,76,27,76,27,83,79,70,84];
// Easter Egg
document.onkeyup = function(e){
    keylog.push(e.which);
    keylog = keylog.slice(-10);
    if(keylog.toString() == trigger.toString()) {
        document.getElementById('winamp').classList.toggle('llama');
    }
}

winamp = new Winamp();
winamp.setVolume(50);
winamp.setBalance(0);
winamp.loadFile('https://mediacru.sh/download/Q2HAoRHE-JvD.mp3', "1. DJ Mike Llama - Llama Whippin' Intro <0:05>  ***  ");
