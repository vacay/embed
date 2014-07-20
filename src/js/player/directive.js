/* global app, document */

app.directive('player', function() {
    return {
	restrict: 'A',
	link: function(scope, elem) {
	    var height = elem[0].offsetHeight;
	    var isOpen = false;
	    var margin = document.body.classList.contains('mobile') ? '-70px' : '-50px';

	    var close = function() {
		isOpen = false;
		elem.css('-webkit-transform', '');
		elem.css('margin-top', margin);
	    };

	    var open = function() {
		isOpen = true;
		elem.css('-webkit-transform', 'translate3d(0, -100%, 0)');
		elem.css('margin-top', '0px');
	    };

	    var toggle = function() {
		isOpen ? close() : open();
	    };

	    scope.move = function(e) {
		e.gesture.preventDefault();
		var distance = isOpen ? -height + e.gesture.deltaY : e.gesture.deltaY;
		elem.css('-webkit-transform', 'translate3d(0, ' + distance + 'px, 0)');
	    };

	    scope.snap = function(e) {
		e.gesture.preventDefault();
		var ratio = Math.abs(e.gesture.deltaY) / height;
		if (ratio > 0.5 || e.gesture.velocityY > 0.3) {
		    e.gesture.direction === 'down' ? close() : open();
		} else {
		    isOpen ? open() : close();
		}
	    };

	    scope.toggle = toggle;
	}
    };
});
