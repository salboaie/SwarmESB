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
			// console.log("UserId", self.userId);
			getUserInfo(self.userId, S(function (err, result) {
				if (err) {
					self.err = err.message;
					self.home('failed');
				} else {
					// console.log(result);
					if (result) {
						var menu = [];
						switch (result.zones.toLowerCase()) {
							case 'administrator': // admin
								menu.push({
										icon: "glyphicon glyphicon-user",
										name: "Users Management",
										url: "apps/examples/UserManagement/index.html"
									}
								);
							case 'organizer': // super user
								menu.push({
									icon: "glyphicon glyphicon-list-alt",
									name: "News Management",
									url: "apps/examples/NewsManager/index.html"
								});
							case 'member': // user
								menu.push({
									icon:"glyphicon glyphicon-bullhorn",
									name: "News",
									url: "apps/examples/News/index.html",
									default: true
								});
								break;
							default:
								break;
						}
						self.result = menu;
						self.home('gettingListDone');

					} else {
						self.err = "Null data from swarms";
						self.home('failed');
					}
				}
			}))
		}
	}
};

menuCtrl;