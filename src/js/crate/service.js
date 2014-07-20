/* global app */

app.factory('Crate', ['$http', 'api', '$rootScope', 'User', '$log', function($http, api, $rootScope, User, $log) {

    return {

	browse: function(options, cb) {
	    $http.get(api + '/me/crate', {
		params: options
	    }).success(function(response) {
		cb(null, response.data);
	    }).error(function(response) {
		cb(response.data, null);
	    });
	},

	create: function(id, cb) {
	    $rootScope.$broadcast('crate:create', id, User.data);
	    $http.post(api + '/vitamin/' + id + '/crate').success(function(response) {
		cb(null, response.data);
	    }).error(function(response) {
		cb(response.data, null);
	    });
	},

	destroy: function(id, cb) {
	    $rootScope.$broadcast('crate:destroy', id);
	    $http.delete(api + '/vitamin/' + id + '/crate').success(function(response) {
		cb(null, response.data);
	    }).error(function(response) {
		cb(response.data, null);
	    });
	}

    };
}]);
