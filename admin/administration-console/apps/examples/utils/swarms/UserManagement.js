var testConnection =
{
    createUser:function(userData){
        // ("Creating user with data:",userData);
        this.userData = userData;
        this.swarm("create")
    },
    create:{
        node:"UsersManager",
        code: function(){
            var self  = this;
            createUser(this.userData,S(function(err,result){
                if(err){
                    self.error = err.message;
                    self.home('failed');
                }else{
                    self.result = result;

                    if(result.zones){
                        result.zones.split(",").forEach(function(zone){
                            startSwarm("acl.js","addNewUserZone",result.userId,zone);
                        })
                    }

                    self.home('userCreated');
                }
            }))
        }
    },
    editUser:function(userData){
        this.userData = userData;
        this.swarm("edit");
    },
    edit:{
        node:"UsersManager",
        code: function(){
            var self  = this;
            getUserInfo(self.userData.userId,S(function(err,result){
				if(err){
                    self.error = err.message;
                    self.home('failed');
                }else {
					if(result.zones){
						var oldZones = result.zones.split(",");
					}
					updateUser(self.userData, S(function (err, result) {
                        if (err) {
                            self.error = err.message;
                            self.home('failed');
                        } else {
                            self.result = result;
                            var newZones = result.zones.split(",");
                            // console.log(newZones);
                            var toBeRemoved = oldZones.filter(function(oldZone){
                                return newZones.indexOf(oldZone)!==-1;
                            });
                            toBeRemoved.forEach(function (zone) {
                                startSwarm("acl.js", "delUserZone", result.userId, zone);
                            });


                            var toBeAdded = newZones.filter(function(newZone){
                                return oldZones.indexOf(newZone)!==-1;
                            });
                            toBeAdded.forEach(function (zone) {
                                startSwarm("acl.js", "addNewUserZone", result.userId, zone);
                            });

                            self.home('userEdited');
                        }
                    }))
                }
            }))
        }
    },
    filterUsers:function(filter){
        console.log("Fetching users matching filter :",filter);
        this['filter'] = filter;
        this.swarm("filter");
    },
    filter:{
        node:"UsersManager",
        code: function(){
            var self  = this;
            filterUsers(this['filter'],S(function(err,result){
                if(err){
                    self.error = err.message;
                    self.home('failed');
                }else{
                    self.result = result;
                    self.home('gotFilteredUsers');
                }
            }))
        }
    },
	currentLoggedIn: function(){
		console.log("Getting id for profile: ");
		this.id = this.getUserId();
		console.log(this.id);
		this.swarm("getUserData");
	},
    getUserData:{
        node: "UsersManager",
        code: function () {
            var self = this;
			getUserInfo(self.id, S(function(err,result) {
                if(err){
					self.err = err.message;
					self.home('failed');
                }else{
                    if(result){
						delete(result.__meta);
						delete(result.salt);
						delete(result.password);
						self.result = result;
						self.home('gotLoggedInDataDone');
                    }else{
						self.err = "Null data from swarms";
						self.home('failed');
                    }
                }
			}))
		}
    },

	changePassword: function(user){
		this.user=user;
	    this.swarm("setNewPassword");
	},
	setNewPassword:{
		node:"UsersManager",
		code: function(){
			var self  = this;
			getUserInfo(self.user.userId,S(function(err,result){
				if(err){
					self.error = err.message;
					self.home('failed');
				}else {
					changeUserPassword(self.user.userId, self.user.current_password, self.user.new_password, S(function (err, result) {
						if (err) {
							self.error = err.message;
							self.home('failed');
						} else {
							self.result = result;
							self.home('userEdited');
						}
					}))
				}
			}))
		}
	},

	getAvatar: function(){
		this.id = this.getUserId();
		this.swarm("getUserAvatar");
	},
	getUserAvatar:{
		node:"UsersManager",
		code: function(){
			var self  = this;
			getUserInfo(self.id, S(function(err,result) {
				if(err){
					self.err = "Error occured while getting your avatar.";
					self.home('failed');
				}else{
					if(result){
						self.result = {
							name : result.lastName + ' ' + result.firstName,
							role : result.zones,
							avatar : result.avatar,
							userId : result.userId
						};
						self.home('gotAvatarDone');
					}else{
						self.err = "Null data from swarms";
						self.home('failed');
					}
				}
			}))
		}
	}
};

testConnection;