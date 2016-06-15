module.exports = angular.module('dmSpinner.component', [])
	.component('dmSpinner', {
		controller: 'SpinnerController',
		controllerAs: 'svm',
		transclude: true,
		bindings: {
			name: '@?',
			group: '@?',
			show: '=?',
			register: '@?',
			onLoaded: '&?',
			onShow: '&?',
			onHide: '&?'
		},
		template: '<div ng-show="svm.show" class="cssload-container"><div class="cssload-speeding-wheel"></div><div ng-transclude></div></div>'
	})
	.controller('SpinnerController', SpinnerController)
	.factory('spinnerService', spinnerService);


SpinnerController.$inject = ['$scope', 'spinnerService'];
/* @ngInject */
function SpinnerController($scope, spinnerService) {
	var vm = this;

	/* Register should be true by default if not specified.*/
	if(!vm.hasOwnProperty('register')) {
		vm.register = true;
	}else {
		vm.register = !!vm.register;
	}

	/* Declare an API to hand off to our service. */
	var api = {
		name: vm.name,
		group: vm.group,
		show: function () {
			vm.show = true;
		},
		hide: function () {
			vm.show = false;
		},
		toggle: function () {
			vm.show = !vm.show;
		}
	},
	/* Object to send to any callback function configured 
	 with this spinner (onShow, onHide, onLoaded) */
	spinnerReturnObj = {
		spinnerService: spinnerService,
		spinnerApi: api
	};
	/* Register this spinner with the spinner service. */
	if(vm.register === true) {
		spinnerService.register(api);
	}
	/* When the component is destroyed remove it from the 
	 registered spinners list inthe spinnerService */
	$scope.$on('$destroy', handleDestroy);
	/* If an onShow or onHide expression was provided,
	register a watcher that will fire the relevant
	expression when show's value changes. */
	if (vm.onShow || vm.onHide) {
		$scope.$watch(function() { 
			return vm.show; 
		}, handleShowChange);
	}
	function handleShowChange(show) {
		if(show && vm.onShow) {
			vm.onShow(spinnerReturnObj);
		} else if (!show && vm.onHide) {
			vm.onHide(spinnerReturnObj);
		}
	}
	function handleDestroy() {
		spinnerService.unregister(vm.name);
	}
	/* This spinner is good to go.
	Fire the onLoaded expression if provided. */
	if(vm.onLoaded) {
		vm.onLoaded(spinnerReturnObj);
	}

}
/* The spinner-service is used by the spinner component to register new spinners.
 * It's also used by anyone who wishes to interface with the API to hide/show spinners on the page. */
spinnerService.$inject = [];
/* @ngInject */
function spinnerService() {
  // create an object to store spinner APIs.
	var spinners = {},
		service = {
			register: register,
			unregister: unregister,
			unregisterGroup: unregisterGroup,
			unregisterAll: unregisterAll,
			show: show,
			hide: hide,
			showGroup: showGroup,
			hideGroup: hideGroup,
			showAll: showAll,
			hideAll: hideAll
		};

	return service;

	/* Method for spinner registration.*/
	function register(data) {
		if(!data.hasOwnProperty('name')) {
			throw new Error('Spinner must specify a name when registering with the spinner service.');
		}
		if(spinners.hasOwnProperty(data.name)) {
			throw new Error('A spinner with the name "' + data.name + '" has already been registered.');
		}
		spinners[data.name] = data;
	}
	/* Method for unregistering a directive */
	function unregister(name) {
		if(spinners.hasOwnProperty(name)) {
			delete spinners[name];
		}
	}
	function unregisterGroup(group) {
		for(var name in spinners) {
			if(spinners.hasOwnProperty(name) && spinners[name].group === group) {
				delete spinners[name];
			}
		}
	}
	function unregisterAll() {
		for(var name in spinners) {
			if(spinners.hasOwnProperty(name)) {
				delete spinners[name];
			}
		}
	}
	function show(name) {
		var spinner = spinners[name];
		if(!spinner) {
			throw new Error('No spinner named "' + name + '" is registered.');
		}
		spinner.show();
	}
	function hide(name) {
		var spinner = spinners[name];
		if(!spinner) {
			throw new Error('No spinner named "' + name + '" is registered.');
		}
		spinner.hide();
	}
	function showGroup(group) {
		var groupExists = false;
		for (var name in spinners) {
			if(spinners.hasOwnProperty(name)) {
				var spinner = spinners[name];
				if (spinner.group === group) {
					spinner.show();
					groupExists = true;
				}
			}
		}
		if (!groupExists) {
			throw new Error('No spinners found with group "' + group + '".');
		}
	}
	function hideGroup(group) {
		var groupExists = false;
		for (var name in spinners) {
			if(spinners.hasOwnProperty(name)) {
				var spinner = spinners[name];
				if (spinner.group === group) {
					spinner.hide();
					groupExists = true;
				}
			}
		}
		if (!groupExists) {
			throw new Error('No spinners found with group "' + group + '".');
		}
	}
	function showAll() {
		for(var name in spinners) {
			if(spinners.hasOwnProperty(name)) {
				spinners[name].show();
			}
		}
	}
	function hideAll() {
		for(var name in spinners) {
			if(spinners.hasOwnProperty(name)) {
				spinners[name].hide();
			}
		}
	}
	
}
