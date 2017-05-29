var userManagement =
{
    createUser: function (userData) {
        console.log("Creating user with data:", userData);
        this.userData = userData;
        this.swarm("create")
    },
    create: {
        node: "UsersManager",
        code: function () {
            var self = this;
            createUser(this.userData, S(function (err, result) {
                if (err) {
                    self.error = err.message;
                    self.home('failed');
                } else {
                    self.result = result;

                    if (result.zones) {
                        result.zones.split(",").forEach(function (zone) {
                            startSwarm("acl.js", "addNewUserZone", result.userId, zone);
                        })
                    }

                    self.home('userCreated');
                }
            }))
        }
    },

    editUser: function (userData) {
        this.userData = userData;
        this.swarm("edit")
    },
    edit: {
        node: "UsersManager",
        code: function () {
            var self = this;
            getUserInfo(self['userData'].userId, S(function (err, result) {
                if (err) {
                    self.error = err.message;
                    self.home('failed');
                } else {
                    var oldZones = result.zones && result.zones !== "" ? result.zones.split(",") : []

                    updateUser(self['userData'], S(function (err, result) {

                        if (err) {
                            self.error = err.message;
                            self.home('failed');
                        } else {
                            self.result = result;
                            var newZones = result.zones && result.zones !== "" ? result.zones.split(",") : [];

                            var toBeRemoved = oldZones.filter(function (oldZone) {
                                return newZones.indexOf(oldZone) !== -1;
                            });
                            toBeRemoved.forEach(function (zone) {
                                startSwarm("acl.js", "delUserZone", result.userId, zone);
                            });


                            var toBeAdded = newZones.filter(function (newZone) {
                                return oldZones.indexOf(newZone) !== -1;
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

    filterUsers: function (filter) {
        console.log("Fetching users matching filter :", filter);
        this['filter'] = filter;
        this.swarm("filter");
    },
    filter: {
        node: "UsersManager",
        code: function () {
            var self = this;
            filterUsers(this['filter'], S(function (err, result) {
                if (err) {
                    self.error = err.message;
                    self.home('failed');
                } else {
                    self.result = result;
                    self.home('gotFilteredUsers');
                }
            }))
        }
    },


    changePassword: function (user) {
        this.user = user;
        this.swarm("setNewPassword");
    },
    setNewPassword: {
        node: "UsersManager",
        code: function () {
            var self = this;
            getUserInfo(self.user.userId, S(function (err, result) {
                if (err) {
                    self.error = err.message;
                    self.home('failed');
                } else {
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
    }
};
userManagement;