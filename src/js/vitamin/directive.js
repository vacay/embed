/* global app */

app.directive('vitamin', ['Sound', 'Queue', 'User', '$rootScope', 'Vitamin', 'ngDialog', 'Crate', '$log', function (Sound, Queue, User, $rootScope, Vitamin, ngDialog, Crate, $log) {
    return {
	restrict: 'AE',
	templateUrl: function(elem, attrs) {
	    return attrs.templateUrl || '/layouts/vitamin.html';
	},
	link: function (scope) {

	    scope.play = function () {
		Sound.play(scope.vitamin);
	    };

	    scope.playNext = function () {
		Queue.addNext(scope.vitamin);
	    };

	    scope.isPlaying = function() {
		return scope.vitamin ? Sound.isPlaying(scope.vitamin.id) : false;
	    };

	    scope.toggleQueue = function() {
		Queue.isQueued(scope.vitamin) ? this.unqueue() : this.queue();
	    };

	    scope.queue = function () {
		Queue.add(scope.vitamin);
	    };

	    scope.isQueued = function () {
		return scope.vitamin ? Queue.isQueued(scope.vitamin) : false;
	    };

	    scope.unqueue = function () {
		Queue.remove(scope.vitamin);
	    };

	    scope.editTitle = function() {
		$rootScope.$broadcast('vitamin:update:show', scope.vitamin);
	    };

	    scope.$on('vitamin:update', function(e, id, title) {
		if (scope.vitamin && scope.vitamin.id === id) {
		    scope.vitamin.title = title;
		}
	    });

	    scope.$on('crate:create', function(e, id, user) {
		if (scope.vitamin && scope.vitamin.id === id) {
		    scope.vitamin.crates = [user];
		}
	    });

	    scope.$on('crate:destroy', function(e, id) {
		if (scope.vitamin && scope.vitamin.id === id) {
		    scope.vitamin.crates.length = 0;
		}
	    });

	    scope.isCrated = function() {
		return scope.vitamin && scope.vitamin.crates.length ? true : false;
	    };

	    scope.toggleCrate = function() {
		scope.isCrated() ? this.uncrate() : this.crate();
	    };

	    scope.crate = function() {
		Crate.create(scope.vitamin.id, function(err) {
		    if (err) $log.error(err);
		});
	    };

	    scope.uncrate = function() {
		Crate.destroy(scope.vitamin.id, function(err) {
		    if (err) $log.error(err);
		});
	    };

	    scope.$on('vitamin:crate:create', function() {
		if (!scope.isCrated()) {
		    scope.crate();
		}
	    });

	    scope.summary = function() {
		ngDialog.open({
		    template: '/partials/vitamin/summary.html',
		    controller: 'VitaminSummaryCtrl',
		    scope: scope
		});
	    };

	}
    };
}]);
