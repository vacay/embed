/* global app */

app.directive('notification', ['$timeout', 'Notification', function($timeout, Notification) {
    return {
	restrict: 'EA',
	template: '<div class="notification" ng-class="type && \'notification-\' + type"><a ng-show="closeable" class="close" ng-click="close()"></a><div ng-transclude></div></div>',
	transclude: true,
	replace: true,
	scope: {
	    type: '=',
	    close: '&',
	    notificationId: '='
	},
	link: function(scope, elem, attrs) {

	    scope.closeable = 'close' in attrs;

	    scope.close = function() {
		Notification.close(scope.notificationId);
	    };

	    $timeout(function() {
		Notification.shift();
	    }, 2500);
	}
    };
}]);
