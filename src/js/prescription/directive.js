/* global app */

app.directive('prescription', ['Sound', 'ngDialog', 'Queue', 'Prescription', '$timeout', 'Notification', '$location', '$log', function(Sound, ngDialog, Queue, Prescription, $timeout, Notification, $location, $log) {
    return {
	restrict: 'E',
	templateUrl: function(elm, attrs) {
	    return attrs.templateUrl || '/layouts/prescription.html';
	},
	link: function(scope) {

	    var create = function() {
		var vitamins = [];
		for (var i=0; i<scope.prescription.vitamins.length; i++) {
		    vitamins.push({
			vitamin_id: scope.prescription.vitamins[i].id,
			order: i
		    });
		}

		Prescription.create(scope.prescription.image_url, scope.prescription.description, vitamins, function(err, prescription) {
		    if (err) {
			$log.error(err);
			Notification.add('error', 'Unable to save prescription');
		    } else {
			scope.prescription.id = prescription.id;
			$location.path('/prescription/' + prescription.id + '/edit');
		    }
		});
	    };

	    var save = function() {

		if (!scope.prescription.id) {
		    create();
		    return;
		}

		if (scope.prescription.published_at && !scope.prescription.description) {
		    Notification.add('error', 'Your prescription must have a description');
		    return;
		}

		if (scope.prescription.published_at && !scope.prescription.vitamins.length) {
		    Notification.add('error', 'Your prescription must have at least one vitamin');
		    return;
		}

		var vitamins = [];
		for (var i=0; i<scope.prescription.vitamins.length; i++) {
		    vitamins.push({
			vitamin_id: scope.prescription.vitamins[i].id,
			order: i
		    });
		}

		Prescription.update(scope.prescription.id, scope.prescription.image_url, scope.prescription.description, vitamins, function(err) {
		    if (err) {
			$log.error(err);
			Notification.add('error', 'Unable to save prescription');
			return;
		    }
		    Notification.add('success', 'Prescription saved');
		});
	    };

	    var destroyImageListener = scope.$watch('prescription.image_url', function(newValue, oldValue) {
		if (newValue !== oldValue && typeof oldValue !== 'undefined') {
		    save();
		}
	    });

	    var destroyDescriptionListener = scope.$watch('prescription.description', function(newValue, oldValue) {
		if (newValue !== oldValue && typeof oldValue !== 'undefined') {
		    save();
		}
	    });

	    var destroyVitaminListener = scope.$watch('prescription.vitamins', function(newValue, oldValue) {
		if (typeof newValue === 'undefined') return;
		if (typeof oldValue === 'undefined') return;

		var changed = false;

		if (newValue.length !== oldValue.length) {
		    changed = true;
		} else {
		    for (var i=0; i<newValue.length; i++) {
			if (newValue[i].id !== oldValue[i].id) {
			    changed = true;
			    break;
			}
		    }
		}

		if (changed) save();
	    }, true);

	    scope.owner = false;
	    scope.editable = scope.editable ? scope.editable : false;
	    scope.prescription = scope.prescription ? scope.prescription : {};

	    scope.playAll = function() {
		Sound.play(scope.prescription.vitamins);
	    };

	    scope.queueAll = function() {
		Queue.add(scope.prescription.vitamins);
	    };

	    scope.crateAll = function() {
		scope.$broadcast('vitamin:crate:create');
	    };

	    scope.publish = function() {

		if (!scope.prescription.image_url) {
		    Notification.add('error', 'You must set an image for your prescription');
		    return;
		}

		if (!scope.prescription.description) {
		    Notification.add('error', 'You must have a description for your prescription');
		    return;
		}

		if (!scope.prescription.vitamins.length) {
		    Notification.add('error', 'You must have at least one vitamin for your prescription');
		    return;
		}

		Prescription.publish(scope.prescription.id, function(err, prescription) {
		    if (err) {
			$log.error(err);
			Notification.add('error', 'Unable to publish prescription');
		    } else {
			$location.path('/prescription/' + prescription.id);
		    }
		});
	    };

	    scope.destroy = function(idx) {
		destroyImageListener();
		destroyDescriptionListener();
		destroyVitaminListener();
		Prescription.destroy(scope.prescription.id, function(err) {
		    if (err) $log.error(err);
		    else scope.$emit('prescription:destroyed', scope.prescription.id, idx);
		});
	    };

	    var isOwner = function(newValue) {
		if (newValue && newValue.username === scope.username) {
		    scope.owner = true;
		}
	    };

	    scope.$watch('prescription.prescriber', isOwner);

	    scope.hasVitamin = function(vitamin) {
		var found = -1;
		var id = vitamin.id;
		for (var i=0; i<scope.prescription.vitamins.length; i++) {
		    if (scope.prescription.vitamins[i].id === id) {
			found = i;
			break;
		    }
		}
		return found;
	    };

	    scope.addVitamin = function(vitamin) {
		var duplicate = false;
		for (var i=0; i<scope.prescription.vitamins.length; i++) {
		    if (scope.prescription.vitamins[i].id === vitamin.id) {
			duplicate = true;
			break;
		    }
		}
		if (!duplicate) scope.prescription.vitamins.push(vitamin);
		else Notification.add('error', '"' + vitamin.title + '" is a duplicate');
	    };

	    scope.removeVitamin = function(vitamin, idx) {
		scope.prescription.vitamins.splice(idx, 1);
	    };

	    scope.showVitaminForms = function() {
		ngDialog.open({
		    template: '/partials/vitamin/forms.html',
		    controller: 'VitaminFormsCtrl',
		    scope: scope
		});
	    };

	    scope.handleImageClick = function() {
		if (scope.editable) {
		    ngDialog.open({
			template: '/partials/image/forms.html',
			controller: 'ImageFormsCtrl',
			scope: scope
		    });
		} else if (!scope.prescription.published_at) {
		    scope.go('/prescription/' + scope.prescription.id + '/edit');
		} else {
		    scope.go('/prescription/' + scope.prescription.id);
		}
	    };
	}
    };
}]);
