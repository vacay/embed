/* global app */

app.controller('PrescriptionReadCtrl', ['$scope', 'Prescription', '$location', '$log', 'Queue', function($scope, Prescription, $location, $log, Queue) {
    
    var init, prescription_id = $location.search().prescription_id;

    $scope.loaded = false;
    $scope.loading = false;
    $scope.noMore = false;
    $scope.showAll = true;

    init = function() {
	Prescription.read(prescription_id, function(err, prescription) {
	    if (err) {
		$log.error(err);
		$location.path('/');
	    } else {
		$scope.prescription = prescription;
		Queue.add($scope.prescription.vitamins);
		$scope.loaded = true;
		$scope.noMore = true;
	    }
	});
    };

    init();
}]);
