app.controller('profilePageController', ['$scope', 'swarmHubService', '$timeout', 'notifyDefaults', function ($scope, swarmHubService, $timeout, notifyDefaults) {
	$.notifyDefaults(notifyDefaults);

	//INIT VARS AND CALL SWARMS
	var hub = swarmHubService.hub;
	$scope.fetching = true;
	$scope.userData;


	hub.on("UserInfo.js","result", populateUserData);
	hub.startSwarm("UserInfo.js", "info");
	hub.on("UserInfo.js", "failed", failedAlert);

	/*hub.on("UserManagement.js", "gotLoggedInDataDone", populateUserData);
	hub.startSwarm("UserManagement.js", "currentLoggedIn");
	hub.on("UserManagement.js", "failed", failedAlert);*/

	hub.on("UserManagement.js", "userEdited", function (swarm) {
		if ($scope.userData.userId === swarm.result.userId) {
			for (var field in swarm.result.userId) {
				$scope.userData[field] = swarm.result[field];
			}
			$.notify({
				icon: 'glyphicon glyphicon-ok',
				message: "Account details edited successfully!"
			}, {
				type: 'success'
			});
			return true;
		}
		return false;
	});


	function populateUserData(swarm) {
		console.log(swarm);
		$scope.fetching = false;
		$scope.userData = swarm.result;
		$scope.$apply();
	}

	function failedAlert(swarm) {
		$.notify({
			icon: 'glyphicon glyphicon-warning-sign',
			message: swarm.error
		}, {
			type: 'danger'
		});
	}

	$scope.saveAcctDetails = function (user) {
		hub.startSwarm("UserManagement.js", "editUser", user);
	};

	$scope.changePassword = function (user) {
		hub.startSwarm("UserManagement.js", "changePassword", user);
	};

	$scope.model = {
		details: [
			{
				name: "email",
				nice: "Email Address",
				type: "email",
				placeholder: "john.doe@example.com",
				error: [{
					type: "required",
					message: "Email is required."
				}, {
					type: "email",
					message: "Field input is not valid. Please type an email address."
				}]
			}
		],

		changepwd: [
			{
				name: "current_password",
				nice: "Your current password",
				type: "password",
				placeholder: "Your password",
				error: [{
					type: "required",
					message: "Current password is required."
				}],
				match: "current_password",
				notmatch:"new_password"
			},
			{
				name: "new_password",
				nice: "Pick a new password",
				type: "password",
				placeholder: "New Password",
				error: [{
					type: "required",
					message: "New password is required."
				},{
					type:"pwmatchne",
					message: "You need to pick another password."
				}],
				match: "new_password",
				notmatch:"current_password"
			},
			{
				name: "rnew_password",
				nice: "Repeat new password",
				type: "password",
				placeholder: "New Password",
				error: [{
					type: "required",
					message: "You need to type again your new password."
				},{
					type:"pwmatch",
					message:"Passwords have to match!"
				},{
					type:"pwmatchne",
					message: "You need to pick another password."
				}],
				match: "new_password",
				notmatch:"current_password"
			}
		]


	};
}]);
