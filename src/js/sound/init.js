/* global app, soundManager, youtubeManager */

app.run(['Sound', function(Sound) {

    soundManager.setup({
	url: 'app://vacay/assets/swf/',
	flashVersion: 9,
	wmode: 'transparent',
	preferFlash: true,
	useFlashBlock: true,
	onready: function () {
	    Sound.init();
	}
    });

    youtubeManager.setup({
	height: 200,
	width: 200,
	playerId: 'ym-container'
    });

}]);
