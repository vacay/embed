/* global app, analytics, document */

//TODO: persist queue across visits/sessions & devices
app.factory('Queue', ['$rootScope', function($rootScope){

    return {

	queue: [],
	
	getNext: function() {
	    var vitamin = this.queue.shift();
	    $rootScope.$broadcast('queue:update');
	    return vitamin;
	},
	
	add: function(vitamin) {
	    if (vitamin instanceof Array) {
		this.queue = this.queue.concat(vitamin);
	    } else {
		this.queue.push(vitamin);
	    }
	    document.body.classList.add('show-player');
	    $rootScope.$broadcast('queue:update');
	    analytics.track('queue:create');
	},
	
	addNext: function(vitamin) {
	    if (vitamin instanceof Array) {
		this.queue = vitamin.concat(this.queue);
	    } else {
		this.queue.unshift(vitamin);
	    }
	    $rootScope.$broadcast('queue:update');
	    analytics.track('queue:create');
	},
	
	remove: function(vitamin) {
	    var self = this, i = 0;
	    for ( ; i < self.queue.length; i++) {
		if (self.queue[i].id === vitamin.id) {
		    self.queue.splice(i, 1);
		    $rootScope.$broadcast('queue:update');
		    break;
		}
	    }
	    analytics.track('queue:destroy');
	},
	
	clear: function() {
	    this.queue.length = 0;
	    $rootScope.$broadcast('queue:update');
	    analytics.track('queue:clear');
	},
	
	isQueued: function(vitamin) {
	    var self = this, i = 0;
	    for ( ; i < self.queue.length; i++) {
		if (self.queue[i].id === vitamin.id) {
		    return true;
		}
	    }
	    return false;
	}
    };
}]);
