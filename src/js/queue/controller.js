/* global app */

app.controller('QueueCtrl', ['$scope', 'Queue', function ($scope, Queue) {

    $scope.queue = Queue.queue;
    $scope.clear = Queue.clear;

    $scope.$on('queue:update', function() {
	$scope.queue = Queue.queue;
    });
}]);
