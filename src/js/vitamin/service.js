/* global app, angular, analytics */

app.service('Vitamin', ['$http', '$rootScope', 'api', function($http, $rootScope, api) {

    return {

	summary: function(id, cb) {
	    $http.get(api + '/vitamin/' + id + '/summary')
		.success(function(response) {
		    cb(null, response.data);
		    analytics.track('vitamin:summary');
		}).error(function(response) {
		    cb(response.data || 'failed to load', null);
		});
	},
	
	create: function(url, title, cb) {
	    $http.post(api + '/vitamin', {
		url: url,
		title: title
	    }).success(function(response) {
		cb(null, response.data);
		analytics.track('vitamin:create');
	    }).error(function(response) {
		cb(response.data || 'failed to load', null);
	    });
	},

	read: function(id, cb) {
	    $http.get(api + '/vitamin/' + id)
		.success(function(response) {
		    cb(null, response.data);
		    analytics.track('vitamin:view');
		}).error(function(response) {
		    cb(response.data || 'failed to load', null);
		});
	},

	update: function(id, title, original) {
	    $rootScope.$broadcast('vitamin:update', id, title);
	    $http.put(api + '/vitamin/' + id, {
		title: title
	    }).success(function() {
		analytics.track('vitamin:update');
	    }).error(function() {
		$rootScope.$broadcast('vitamin:update', id, original);
	    });
	},

	prescriptions: function(id, cb) {
	    $http.get(api + '/vitamin/' + id + '/prescriptions')
		.success(function(response) {
		    cb(null, response.data);
		})
		.error(function(response) {
		    cb(response.data || 'failed to load', null);
		});
	},

	getTitleSuggestions: function(fpId, cb) {
	    var lfmUrl = 'http://ws.audioscrobbler.com/2.0/?' + [
		'method=track.getfingerprintmetadata',
		'fingerprintid=' + encodeURIComponent(fpId),
		'api_key=362fa9fa7f6246d30a5095ebfefb46b0',
		'format=json'
	    ].join('&');
	    
	    var request = $http.get(lfmUrl);
	    
	    request.success(function(data) {
		if (data.error) return cb(data.message, null);
		if (data.tracks && data.tracks.track) {
		    if (!angular.isArray(data.tracks.track)) data.tracks.track = [data.tracks.track];
		    return cb(null, data.tracks.track);
		}
		return cb('lastfm api response missing tracks', data);
	    });
	    
	    request.error(function(data) {
		if (data.error) {
		    cb(data.message, null);
		    return;
		}
		cb('lastfm api error', null);
	    });
	    
	}
    };
}]);
