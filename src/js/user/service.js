/* global app, analytics */

app.factory('User', ['$rootScope', '$http', 'api', 'Utils', function ($rootScope, $http, api, Utils) {
    return {
	id: null,
	username: null,
	data: null,
	subscriptions: [],
	authenticated: null,

	init: function (user) {
	    this.id = user.id;
	    this.username = user.username;
	    this.subscriptions = user.subscriptions;
	    this.authenticated = true;

	    this.data = user;
	    delete this.data.subscriptions;

	    $rootScope.$broadcast('user:initialized');
	    $rootScope.$broadcast('user:subscriptions:update');
	    $rootScope.$broadcast('user:authenticated', user.username);
	},

	deauthenticate: function() {
	    this.id = null;
	    this.username = null;
	    this.data = null;
	    this.subscriptions = [];
	    this.authenticated = false;
	    $rootScope.$broadcast('user:deauthenticated');
	},

	subscribe: function(user, cb) {

	    this.subscriptions.push(user);
	    $rootScope.$broadcast('user:subscriptions:update');
	    
	    $http.post(api + '/user/' + this.username + '/subscription', {
		prescriber_id: user.id
	    }).success(function(response) {
		$rootScope.$broadcast('inbox:refresh');
		cb(null, response.data);
		analytics.track('subscription:create');
	    }).error(function(response) {
		cb(response.data || 'failed to load', null);
	    });

	},
	
	unsubscribe: function(id, cb) {
	    
	    for(var i=0; i<this.subscriptions.length; i++) {
		if (this.subscriptions[i].id === id) {
		    this.subscriptions.splice(i, 1);
		}
	    }
	    $rootScope.$broadcast('user:subscriptions:update');
	    
	    $http.delete(api + '/user/' + this.username + '/subscription', {
		params: {
		    prescriber_id: id
		}
	    }).success(function(response) {
		$rootScope.$broadcast('inbox:refresh');
		cb(null, response.data);
		analytics.track('subscription:destroy');
	    }).error(function(response) {
		cb(response.data || 'failed to load', null);
	    });
	},
	
	isSubscribed: function(id) {
	    return Utils.getIdx(this.subscriptions, id) === -1 ? false : true;
	},

	read: function(username, cb) {
	    var request = $http.get(api + '/user/' + username);
	    
	    request.success(function(response) {
		cb(null, response.data);
		analytics.track('user:view');
	    });

	    request.error(function(response) {
		cb(response.data || 'failed to load', null);
	    });
	},

	update: function(data, cb) {
	    var self = this;
	    $http.put(api + '/user/' + this.username, data)
		.success(function(response) {
		    self.data = response.data;
		    cb(null, response.data);
		    analytics.track('user:update');
		})
		.error(function(response) {
		    cb(response.data || 'failed to load', null);
		});
	},

	prescriptions: function(username, offset, cb) {
	    $http.get(api + '/user/' + username + '/prescriptions', {
		params: {
		    offset: offset
		}
	    }).success(function(response) {
		cb(null, response.data);
	    }).error(function(response) {
		cb(response.data || 'failed to load', null);
	    });
	}
    };
}]);
