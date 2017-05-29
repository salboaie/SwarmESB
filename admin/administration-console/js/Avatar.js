function DisplayAvatar(hub){
	var avatarTarget = ".app-avatar";
	var nameTarget = ".app-username";
	var roleTarget = ".app-userrole";
	var userId;

	hub.on("UserManagement.js", "failed", function (swarm) {
		$.notify({
			icon: 'glyphicon glyphicon-warning-sign',
			message: swarm.err
		},{
			type: 'danger'
		});
	});

	hub.on("UserManagement.js", "gotAvatarDone", function (swarm) {
		updateValues(swarm.result);
	});

	hub.on("UserManagement.js", "userEdited", function (swarm) {
		if(userId == swarm.result.userId){
			updateValues(swarm.result);
		}
		$.notify({
			icon: 'glyphicon glyphicon-ok',
			message: "Account details edited successfully!"
		}, {
			type: 'success'
		});
	});

	function updateValues(result) {
		if(result && result.avatar!='' && result.avatar!=null){
			$(avatarTarget).attr('src',result.avatar);
		}
		$(nameTarget).text(result.name);
		$(roleTarget).text(result.role);
		userId = result.userId;
	}

	hub.startSwarm("UserManagement.js", "getAvatar");
}