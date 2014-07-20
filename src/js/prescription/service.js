/* global app, analytics */

app.factory('Prescription', ['$http', 'api', function($http, api) {
    return {
	
	browse: function(options, cb) {
	    $http.get(api + '/prescriptions', {
		params: options
	    }).success(function(response) {
		cb(null, response.data);
		analytics.track('prescription:browse');
	    }).error(function(response) {
		cb(response.data || 'failed to load', null);
	    });
	},

	drafts: function(options, cb) {
	    $http.get(api + '/me/drafts', {
		params: options
	    }).success(function(response) {
		cb(null, response.data);
		analytics.track('prescription:drafts');
	    }).error(function(response) {
		cb(response.data || 'failed to load', null);
	    });
	},

	create: function(image, description, vitamins, cb) {
	    $http.post(api  + '/prescription', {
		image: image || null,
		description: description || null,
		vitamins: vitamins
	    }).success(function(response) {
		cb(null, response.data);
		analytics.track('prescription:create');
	    }).error(function(response) {
		cb(response.data || 'failed to load', null);
	    });
	},

	read: function(id, cb) {
	    $http.get(api + '/prescription/' + id)
		.success(function(response) {
		    cb(null, response.data);
		    analytics.track('prescription:view');
		}).error(function(response) {
		    cb(response.data || 'failed to load', null);
		});
	},

	update: function(id, image, description, vitamins, cb) {
	    $http.put(api + '/prescription/' + id, {
		image: image,
		description: description,
		vitamins: vitamins
	    }).success(function(response) {
		cb(null, response.data);
		analytics.track('prescription:update');
	    }).error(function(response) {
		cb(response.data || 'failed to load', null);
	    });
	},

	publish: function(id, cb) {
	    $http.post(api + '/prescription/' + id + '/publish')
		.success(function(response) {
		    cb(null, response.data);
		    analytics.track('prescription:publish');
		}).error(function(response) {
		    cb(response.data || 'failed to publish');
		});
	},

	destroy: function(id, cb) {
	    $http.delete(api + '/prescription/' + id)
		.success(function(response) {
		    cb(null, response.data);
		    analytics.track('prescription:destroy');
		}).error(function(response) {
		    cb(response.data || 'failed to load', null);
		});
	}

    };
}]);
