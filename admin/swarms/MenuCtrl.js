var menuCtrl = {
	list: function () {
		this.userId = this.getUserId();
		console.log("Getting menu list",this.userId);
		this.swarm("getList");
	},
	getList: {
		node: "UsersManager",
		code: function () {
			var self = this;
			zonesOfUser(self.userId, S(function (err, zones) {
				if (err) {
					self.err = err.message;
					self.home('failed');
				} else {
					var zoneNames = zones.map(function (zone) {
						return zone.zoneName;
					});
					self.result = [];

					if (zoneNames.indexOf("ALL_USERS") !== -1) {
						self.result.push({
							icon: "glyphicon glyphicon-user",
							name: "Users Management",
							url: "apps/examples/UserManagement/index.html"
						});

						self.result.push({
							icon: "glyphicon glyphicon-tasks",
							name: "Create forms",
							url: "apps/examples/FormsCreator/index.html",
							default: true
						});
						self.result.push({
							icon: "glyphicon glyphicon-pencil",
							name: "Answer forms",
							url: "apps/examples/FormsRenderer/index.html",
							default: true
						});
						self.result.push({
							icon: "glyphicon glyphicon-file",
							name: "See form answers",
							url: "apps/examples/FormsAnswers/index.html",
							default: true
						});
						self.result.push({
							icon: "glyphicon glyphicon-envelope",
							name: "Send notifications",
							url: "apps/examples/NotificationDashboard/index.html",
							default: true
						});
						self.result.push({
							icon: "glyphicon glyphicon-lock",
							name: "Access Control List Management",
							url: "apps/examples/ACL-Management/index.html"
						});


					}

					self.home('gettingListDone');
				}
			}))
		}
	}
};

menuCtrl;