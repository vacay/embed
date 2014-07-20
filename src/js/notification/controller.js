/* global app */

app.controller('NotificationCtrl', ['$scope', 'Notification', function($scope, Notification) {
    $scope.notifications = Notification.list;

    $scope.$on('notification:update', function() {
	$scope.notifications = Notification.list;
	if (!$scope.$$phase) $scope.$apply();
    });
}]);
