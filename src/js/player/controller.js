/* global app, document */

app.controller('PlayerProgressCtrl', ['$scope', 'Sound', function ($scope, Sound) {
    $scope.loading = Sound.loading;
    $scope.position = Sound.position;
    $scope.css = Sound.css;
    $scope.time = Sound.time;
    
    $scope.$on('player:position:update', function () {
	$scope.position = Sound.position;
	if (!$scope.$$phase) $scope.$apply();
    });
    
    $scope.$on('player:css:update', function () {
	$scope.css = Sound.css;
	if (!$scope.$$phase) $scope.$apply();
    });
    
    $scope.$on('player:loading:update', function () {
	$scope.loading = Sound.loading;
	if (!$scope.$$phase) $scope.$apply();
    });
    
    $scope.$on('player:time:update', function () {
	$scope.time = Sound.time;
	if (!$scope.$$phase) $scope.$apply();
    });
}]);

app.controller('NowPlayingCtrl', ['$scope', 'Sound', 'Queue', function ($scope, Sound, Queue) {

    $scope.vitamin = null;
    $scope.playing = Sound.playing;

    $scope.togglePlay = Sound.play;
    $scope.previous = Sound.previous;
    $scope.next = Sound.next;

    $scope.queueCount = Queue.queue.length;

    $scope.$on('queue:update', function() {
	$scope.queueCount = Queue.queue.length;
    });

    $scope.toggle = function() {
	document.body.classList.toggle('show-queue');
    };

    $scope.$on('player:css:update', function() {
	$scope.playing = Sound.playing;
    });

    $scope.$on('player:nowplaying:update', function () {
	$scope.vitamin = Sound.nowplaying;
    });
}]);
