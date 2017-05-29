'use strict';

app.controller('userManagerController', ['$scope', 'ModalService', 'swarmHubService', '$timeout', 'notifyDefaults', function ($scope, ModalService, swarmHubService, $timeout, notifyDefaults) {
	$.notifyDefaults(notifyDefaults);

	var hub = swarmHubService.hub;

	$scope.fetching = true;
	$scope.usersToDisplay = [];

	hub.on("UserManagement.js", "gotFilteredUsers", gotResult);

	hub.on("UserManagement.js", "failed", function (swarm) {
		$.notify({
			icon: 'glyphicon glyphicon-warning-sign',
			message: "An error occured!"
		},{
			type: 'danger'
		});
	});

	hub.on("UserManagement.js", "userCreated", function (swarm) {
		$scope.usersToDisplay.push(swarm.result);
		$scope.$apply();
		$.notify({
			icon: 'glyphicon glyphicon-ok',
			message: "User added successfully!"
		},{
			type: 'success'
		});
	});

	hub.on("UserManagement.js", "userEdited", function (swarm) {
		$scope.usersToDisplay.some(function (user) {
			if (user.userId === swarm.result.userId) {
				for (var field in swarm.result.userId) {
					user[field] = swarm.result[field];
				}
				$.notify({
					icon: 'glyphicon glyphicon-ok',
					message: "User updated successfully!"
				},{
					type: 'success'
				});
				return true;
			}
			return false;
		});
	});

	hub.startSwarm("UserManagement.js", "filterUsers", {});


	$scope.createUser = function () {
		ModalService.showModal({
			templateUrl: "tpl/modals/createUser.html",
			controller: "createUserController"
		}).then(function (modal) {
			modal.element.modal();
			modal.close.then(function (userData) {
				hub.startSwarm("UserManagement.js", "createUser", userData);
			});
		});
	};

	$scope.editUser = function (user) {
		ModalService.showModal({
			templateUrl: "tpl/modals/editUser.html",
			controller: "editUserController",
			inputs: {
				"user": user
			}
		}).then(function (modal) {
			modal.element.modal();
			modal.close.then(function (userData) {
				hub.startSwarm("UserManagement.js", "editUser", userData);
				for (var prop in userData) {
					user[prop] = userData[prop];
				}
			});
		});
	};

	$scope.startFilter = function () {
		$('.footable').trigger('footable_filter', {
			filter: $('#filter').val()
		});
	};

	function gotResult(swarm) {
		$scope.fetching = false;
		$scope.usersToDisplay = swarm.result;
		$scope.$apply();
	}

}]);

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

var model = [
	{
		name: "firstName",
		type: "text",
		nice: "Firstname",
		placeholder: "John",
		error: [{
			type: "required",
			message: "First name is required."
		}]
	},
	{
		name: "lastName",
		type: "text",
		nice: "Lastname",
		placeholder: "Doe",
		error: [{
			type: "required",
			message: "Last name is required."
		}]
	},
	{
		name: "email",
		type: "email",
		nice: "Email",
		placeholder: "john.doe@example.com",
		error: [{
			type: "required",
			message: "Email is required."
		}, {
			type: "email",
			message: "Field input is not valid. Please type an email address."
		}]
	},
	{
		name: "username",
		type: "text",
		nice: "Username",
		placeholder: "john.doe",
		error: [{
			type: "required",
			message: "Username is required."
		}]
	},
	{
		name: "avatar",
		type: "url",
		nice: "Avatar",
		placeholder: "Your avatar url",
		error: [{
			type: "required",
			message: "Avatar url is required."
		},{
			type: "url",
			message: "Avatar must be an url format."
		}]
	},
	{
		name: "password",
		type: "password",
		nice: "Password",
		placeholder: "Password",
		error: [{
			type: "required",
			message: "Password is required."
		}]
	}
];

app.controller('createUserController', ['$scope', "$element", 'close', 'usersZones', function ($scope, $element, close, usersZones) {
	$scope.user = {"status": "Active"};
	$scope.createUser = function () {
		$element.modal('hide');
		close($scope.user, 500);
	};
	$scope.model = model;
	$scope.usersZones = usersZones;
}]);

app.controller('editUserController', ['$scope', 'user', '$element', 'close', 'usersZones', function ($scope, user, $element, close, usersZones) {
	$scope.user = {};
	for (var prop in user) {
		$scope.user[prop] = user[prop];
	}
	$scope.saveUser = function () {
		$element.modal('hide');
		close($scope.user, 500);
	};
	$scope.model = model;
	$scope.usersZones = usersZones;
}]);