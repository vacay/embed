/* global app, analytics */

app.factory('Auth', ['$http', 'User', '$rootScope', 'api', function ($http, User, $rootScope, api) {

    return {

	init: function () {
	    $rootScope.$broadcast('auth:initialized');
/*
	    $http.get(api + '/me').success(function (response) {
		User.init(response.data);
		$rootScope.$broadcast('auth:initialized');
		analytics.track('init');
	    }).error(function () {
		$rootScope.$broadcast('auth:initialized');
	    });
*/
	}
    };
}]);
