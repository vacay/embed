/* global app, soundManager, youtubeManager, analytics,
 navigator, document, window, Image, angular */

app.factory('Sound', ['$rootScope', 'Queue', 'User', 'Vitamin', 'Utils', 'Notification', function ($rootScope, Queue, User, Vitamin, Utils, Notification) {
    var sm = soundManager,
	_event,
	ua = navigator.userAgent,
	isTouchDevice = (ua.match(/ipad|ipod|iphone|Android/i)),
	cleanup,
	statusbar = document.getElementById('statusbar-container'),
	soundService = {};

    soundService.css = null;
    soundService.loading = {width: '100%'};
    soundService.position = {width: '0%'};
    soundService.history = [];
    soundService.nowplaying = null;
    soundService.playing = false;
    soundService.soundsByObject = [];
    soundService.lastSound = null;
    soundService.dragActive = false;
    soundService.dragExec = new Date();
    soundService.dragTimer = null;
    soundService.pageTitle = document.title;
    soundService.lastWPExec = new Date();
    soundService.lastWLExec = new Date();
    soundService.time = {};

    soundService.getOffX = function (o) {
	// http://www.xs4all.nl/~ppk/js/findpos.html
	var curleft = 0;
	if (o.offsetParent) {
	    while (o.offsetParent) {
		curleft += o.offsetLeft;
		o = o.offsetParent;
	    }
	} else if (o.x) {
	    curleft += o.x;
	}
	return curleft;
    };

    _event = (function () {
	var old = (window.attachEvent && !window.addEventListener),
	    _slice = Array.prototype.slice,
	    evt = {
		add: (old ? 'attachEvent' : 'addEventListener'),
		remove: (old ? 'detachEvent' : 'removeEventListener')
	    };

	function getArgs(oArgs) {
	    var args = _slice.call(oArgs),
		len = args.length;
	    if (old) {
		args[1] = 'on' + args[1]; // prefix
		if (len > 3) {
		    args.pop(); // no capture
		}
	    } else if (len === 3) {
		args.push(false);
	    }
	    return args;
	}

	function apply(args, sType) {
	    var element = args.shift(),
		method = [evt[sType]];
	    if (old) {
		element[method](args[0], args[1]);
	    } else {
		element[method].apply(element, args);
	    }
	}

	function add() {
	    apply(getArgs(arguments), 'add');
	}

	function remove() {
	    apply(getArgs(arguments), 'remove');
	}
	return {
	    'add': add,
	    'remove': remove
	};
    }());

    soundService.getTheDamnTarget = function (e) {
	return (e.target || (window.event ? window.event.srcElement : null));
    };

    soundService.getTime = function (nMSec, bAsString) {
	// convert milliseconds to mm:ss, return as object literal or string
	var nSec = Math.floor(nMSec / 1000),
	    min = Math.floor(nSec / 60),
	    sec = nSec - (min * 60);
	// if (min === 0 && sec === 0) return null; // return 0:00 as null
	return (bAsString ? (min + ':' + (sec < 10 ? '0' + sec : sec)) : {
	    'min': min,
	    'sec': sec
	});
    };

    soundService.getSoundByObject = function (id) {
	return (typeof soundService.soundsByObject[id] !== 'undefined' ? soundService.soundsByObject[id] : null);
    };

    soundService.setPageTitle = function (sTitle) {
	try {
	    document.title = (sTitle ? sTitle + ' - ' : '') + soundService.pageTitle;
	} catch (e) {
	    // oh well
	    soundService.setPageTitle = function () {
		return false;
	    };
	}
    };

    soundService.events = {
	play: function () {
	    document.body.classList.add('show-player');
	    soundService.playing = true;
	    soundService.css = 'playing';
	    $rootScope.$broadcast('player:css:update');
	    soundService.setPageTitle('\u25B6');

	    if (this._data.vitamin.processed_at) {
		var canvas = document.getElementById('waveform');
		var folder = window.location.hostname === 'vacay.io' ? 'production' : 'development';
		var waveformPath = 'https://s3.amazonaws.com/vacay/' + folder + '/waveforms/' + this._data.vitamin.id + '.png';
		canvas.width = window.innerWidth;
		var context = canvas.getContext('2d');
		var imageObj = new Image();
		imageObj.crossOrigin = 'Anonymous';
		imageObj.onload = function() {
		    context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
		};
		imageObj.src = waveformPath;
	    }
	},
	stop: function () {
	    soundService.playing = false;
	    soundService.position = {width: '0%'};
	    $rootScope.$broadcast('player:position:update');
	    soundService.setPageTitle();
	},
	pause: function () {
	    if (soundService.dragActive) return;
	    soundService.playing = false;
	    soundService.css = 'paused';
	    soundService.setPageTitle('\u25FC');
	    $rootScope.$broadcast('player:css:update');
	},
	resume: function () {
	    if (soundService.dragActive) return;
	    soundService.playing = true;
	    soundService.css = 'playing';
	    soundService.setPageTitle('\u25B6');
	    $rootScope.$broadcast('player:css:update');
	},
	finish: function () {
	    soundService.playing = false;
	    soundService.css = 'paused';
	    soundService.setPageTitle();
	    $rootScope.$broadcast('player:css:update');

	    soundService.next();
	},
	whileloading: function () {
	    var self = this;
	    function doWork() {
		soundService.loading = {width: ((self.bytesLoaded / self.bytesTotal) * 100) + '%'};
		$rootScope.$broadcast('player:loading:update');
	    }
	    
	    var d = new Date();
	    if (d && d - soundService.lastWLExec > 50 || this.bytesLoaded === this.bytesTotal) {
		doWork.apply(this);
		soundService.lastWLExec = d;
	    }
	},
	onload: function () {
	    if (this.loaded) {
		soundService.loading = {width: '100%'};
		$rootScope.$broadcast('player:loading:update');
	    }
	},
	whileplaying: function () {
	    var d = null;

	    if (soundService.dragActive) {

		soundService.updateTime.apply(this);
		soundService.position = {width: ((this.position / this.durationEstimate) * 100) + '%'};
		$rootScope.$broadcast('player:position:update');

	    } else {

		d = new Date();

		if (d - soundService.lastWPExec > 30) {

		    soundService.updateTime.apply(this);
		    var progress = this.position / this.durationEstimate;

		    if (this._data.vitamin.processed_at && progress) {

			var canvas = document.getElementById('waveform');
			var context = canvas.getContext('2d');
			var progressWidth = progress * canvas.width;
			var imageData = context.getImageData(0, 0, progressWidth, canvas.height);
			var data = imageData.data;
			for (var i = 0; i < data.length; i += 4) {
			    data[i] = 211; // red
			    data[i + 1] = 228; // green
			    data[i + 2] = 120; // blue
			}
			context.putImageData(imageData, 0, 0);

			imageData = context.getImageData(progressWidth, 0, (canvas.width - progressWidth), canvas.height);
			data = imageData.data;
			for (i = 0; i < data.length; i += 4) {
			    data[i] = 200; // red
			    data[i + 1] = 200; // green
			    data[i + 2] = 200; // blue
			}
			context.putImageData(imageData, progressWidth, 0);
		    }
		    
		    soundService.position = {width: ( progress * 100) + '%'};
		    $rootScope.$broadcast('player:position:update');
		    soundService.lastWPExec = d;
		}
	    }
	}
    };

    soundService.updateTime = function () {
	soundService.time.position = soundService.getTime(this.position, true);
	soundService.time.total = soundService.getTime(this.durationEstimate, true);
	$rootScope.$broadcast('player:time:update');
    };

    soundService.withinStatusBar = function (o) {
	return (soundService.lastSound !== null && Utils.isChildOfClass(o, 'statusbar-container'));
    };

    soundService.play = function (vitamin) {
	if (vitamin instanceof Array) {
	    var vitamins = angular.copy(vitamin);
	    var first = vitamins.shift();
	    Queue.addNext(vitamins);
	    soundService.load(first, true);
	} else if (vitamin || soundService.nowplaying) {
	    soundService.load(vitamin || soundService.nowplaying, true);
	} else if (Queue.queue[0]) {
	    soundService.load(Queue.getNext(), true);
	} else {
	    Notification.add('warning', 'No vitamins loaded');
	}
    };

    soundService.next = function () {
	if (Queue.queue[0]) {
	    soundService.load(Queue.getNext(), true);
	} else {
	    Notification.add('warning', 'Queue is empty');
	}
    };

    soundService.previous = function () {
	if (!soundService.lastSound || !soundService.history ) {
	    Notification.add('warning', 'No vitamins have been played yet');
	    return;
	}

	if (soundService.lastSound.position > 3000) {
	    soundService.lastSound.setPosition(0);
	    soundService.lastSound.resume();
	} else if (soundService.history[0]) {
	    Queue.addNext(soundService.nowplaying);
	    soundService.load(soundService.history.shift(), false);
	} else {
	    Notification.add('warning', 'At the beginning');
	}
    };

    soundService.load = function (vitamin, createHistory) {
	var soundURL, thisSound, soundId;
	
	soundId = vitamin.id;
	
	if (vitamin.processed_at) {
	    var folder = window.location.hostname === 'localhost' ? 'development' : 'production';
	    soundURL = 'http://s3.amazonaws.com/vacay/' + folder + '/vitamins/' + vitamin.id + '.mp3';
	} else if (vitamin.hosts[0].title === 'youtube') {
	    soundURL = vitamin.hosts[0].url;
	} else {
	    soundURL = vitamin.hosts[0].stream_url;
	}

	thisSound = soundService.getSoundByObject(soundId);
	if (thisSound) {
	    if (thisSound === soundService.lastSound) {
		// ..and was playing (or paused) and isn't in an error state
		if (thisSound.readyState !== 2) {
		    var playState = thisSound && thisSound.player ? thisSound.player.getPlayerState() : thisSound.playState;
		    if (playState !== 1) thisSound.play(); // not yet playing
		    else thisSound.togglePause();
		} else {
		    sm._writeDebug('Warning: sound failed to load (security restrictions, 404 or bad format)', 2);
		}
	    } else {
		if (soundService.lastSound) {
		    soundService.stopSound(soundService.lastSound);
		}

		if (createHistory) {
		    soundService.history.unshift(soundService.nowplaying);
		}
		soundService.nowplaying = vitamin;
		analytics.track('play');
		$rootScope.$broadcast('player:nowplaying:update');
		thisSound.play();
	    }
	} else {
	    // create sound
	    if (soundURL.indexOf('youtube') !== -1) {
		thisSound = youtubeManager.createSound({
		    id: 'youtube-' + soundId,
		    url: decodeURI(soundURL),
		    width: 200,
		    height: 200,
		    onplay: soundService.events.play,
		    onstop: soundService.events.stop,
		    onpause: soundService.events.pause,
		    onresume: soundService.events.resume,
		    onfinish: soundService.events.finish,
		    whileloading: soundService.events.whileloading,
		    whileplaying: soundService.events.whileplaying,
		    onload: soundService.events.onload,
		    volume: window.location.hostname === 'vacay.io' ? 90 : 0
		});
	    } else {
		thisSound = sm.createSound({
		    autoLoad: true,
		    id: soundId,
		    url: decodeURI(soundURL),
		    onplay: soundService.events.play,
		    onstop: soundService.events.stop,
		    onpause: soundService.events.pause,
		    onresume: soundService.events.resume,
		    onfinish: soundService.events.finish,
		    whileloading: soundService.events.whileloading,
		    whileplaying: soundService.events.whileplaying,
		    onload: soundService.events.onload,
		    volume: window.location.hostname === 'vacay.io' ? 90 : 0
		});
	    }

	    thisSound._data = {
		vitamin: vitamin
	    };

	    if (soundService.lastSound) {
		soundService.stopSound(soundService.lastSound);
		if (createHistory) {
		    soundService.history.unshift(soundService.nowplaying);
		}
	    }

	    soundService.soundsByObject[soundId] = thisSound;
	    soundService.nowplaying = vitamin;
	    analytics.track('play');
	    $rootScope.$broadcast('player:nowplaying:update');
	    thisSound.play();
	}
	soundService.lastSound = thisSound;
    };

    soundService.handleMouseDown = function (e) {
	if (isTouchDevice && e.touches) {
	    e = e.touches[0];
	}
	var o = soundService.getTheDamnTarget(e);
	if (!o) {
	    return true;
	}
	if (!soundService.withinStatusBar(o)) {
	    return true;
	}
	soundService.dragActive = true;
	soundService.lastSound.pause();
	soundService.setPosition(e);
	if (!isTouchDevice) {
	    _event.add(statusbar, 'mousemove', soundService.handleMouseMove);
	} else {
	    _event.add(statusbar, 'touchmove', soundService.handleMouseMove);
	}
	return soundService.stopEvent(e);
    };

    soundService.handleMouseMove = function (e) {
	if (isTouchDevice && e.touches) {
	    e = e.touches[0];
	}

	if (soundService.dragActive) {
	    var d = new Date();
	    if (d - soundService.dragExec > 20) {
		soundService.setPosition(e);
	    } else {
		window.clearTimeout(soundService.dragTimer);
		soundService.dragTimer = window.setTimeout(function () {
		    soundService.setPosition(e);
		}, 20);
	    }
	    soundService.dragExec = d;
	} else {
	    soundService.stopDrag();
	}
	e.stopPropagation = true;
	return false;
    };

    soundService.stopDrag = function (e) {
	if (soundService.dragActive) {
	    if (!isTouchDevice) {
		_event.remove(statusbar, 'mousemove', soundService.handleMouseMove);
	    } else {
		_event.remove(statusbar, 'touchmove', soundService.handleMouseMove);
	    }
	    if (soundService.css !== 'paused') {
		soundService.lastSound.resume();
	    } else {
		soundService.position = {
		    width: ((soundService.lastSound.position / soundService.lastSound.durationEstimate) * 100) + '%'
		};
		$rootScope.$broadcast('player:position');
	    }
	    soundService.dragActive = false;
	    soundService.stopEvent(e);
	}
    };

    soundService.handleStatusClick = function (e) {
	soundService.setPosition(e);
	if (soundService.css !== 'paused') {
	    soundService.resume(); //this function may not exist?
	}
	return soundService.stopEvent(e);
    };

    soundService.stopEvent = function (e) {
	if (typeof e !== 'undefined') {
	    if (typeof e.preventDefault !== 'undefined') {
		e.preventDefault();
	    } else {
		e.stopPropagation = true;
		e.returnValue = false;
	    }
	}
	return false;
    };

    soundService.setPosition = function (e) {
	var oThis = soundService.getTheDamnTarget(e),
	    x, oStatusbar, oSound, nMsecOffset;
	if (!oThis) {
	    return;
	}
	oStatusbar = oThis;
	while (!angular.element(oStatusbar).hasClass('statusbar-container') && oStatusbar.parentNode) {
	    oStatusbar = oStatusbar.parentNode;
	}
	oSound = soundService.lastSound;
	x = parseInt(e.clientX, 10);
	nMsecOffset = Math.floor((x - soundService.getOffX(oStatusbar) - 4) / (oStatusbar.offsetWidth) * oSound.durationEstimate);
	if (!isNaN(nMsecOffset)) {
	    nMsecOffset = Math.min(nMsecOffset, oSound.durationEstimate);
	}
	if (!isNaN(nMsecOffset)) {
	    oSound.setPosition(nMsecOffset);
	}
    };

    soundService.stopSound = function (oSound) {
	sm._writeDebug('stopping sound: ' + oSound._data.vitamin.title);
	if (!oSound.videoId) {
	    sm.stop(oSound.id);
	} else {
	    oSound.stop();
	}

	if (!isTouchDevice) { // iOS 4.2+ security blocks onfinish() -> playNext() if we set a .src in-between(?)
	    sm.unload(oSound.id);
	}
    };
    
    soundService.isPlaying = function(id) {
	if (this.playing && this.nowplaying.id === id) return true;
	return false;
    };

    soundService.init = function () {

	sm._writeDebug('Sound.init(): Using default configuration');

	function doEvents(action) { // action: add / remove
	    if (!isTouchDevice) {
		_event[action](statusbar, 'mousedown', soundService.handleMouseDown);
		_event[action](statusbar, 'mouseup', soundService.stopDrag);
	    } else {
		_event[action](statusbar, 'touchstart', soundService.handleMouseDown);
		_event[action](statusbar, 'touchend', soundService.stopDrag);
	    }
	    _event[action](window, 'unload', cleanup);
	}

	cleanup = function () {
	    doEvents('remove');
	};
	
	doEvents('add');

	sm._writeDebug('Sound.init(): Ready', 1);
    };
    return soundService;
}]);
