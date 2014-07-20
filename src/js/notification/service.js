/* global app */

app.factory('Notification', ['$rootScope', function($rootScope) {

    return {

	list: [],

	index: 0,

	isDuplicate: function(msg) {
	    for (var i=0; i<this.list.length; i++) {
		if (this.list[i].msg === msg) {
		    return true;
		}
	    }
	    return false;
	},

	add: function(type, msg) {
	    if (!this.isDuplicate(msg)) {
		this.list.push({
		    id: this.index++,
		    type: type,
		    msg: msg
		});
		$rootScope.$broadcast('notification:update');
	    }
	},

	close: function(id) {
	    for (var i=0; i<this.list.length; i++) {
		if (this.list[i].id === id) {
		    this.list.splice(i, 1);
		    break;
		}
	    }
	    $rootScope.$broadcast('notification:update');
	},

	shift: function() {
	    if (this.list.length) this.list.shift();
	}

    };
}]);
