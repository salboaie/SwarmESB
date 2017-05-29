//TO DO: verify first that the users are not already created!!!!

var initDatabase = {
    meta: {
        name: "initDatabase.js"
    },
    init:function(){
        console.log("Initializing database");
        this.swarm("createDefaultOrganisations");
    },
    createDefaultOrganisations:{
        node:"UsersManager",
        code:function(){
            var self = this;

            function createDefaultOrganisations(callback) {

                var defaultOrganisations = [
                    {
                        organisationId: "SystemAdministrators",
                        displayName: "System Administrators"
                    },
                    {
                        organisationId: "Public",
                        displayName: "PUBLIC"
                    }
                ];
                var createdOrganisations = [];
                var errors = [];
                defaultOrganisations.forEach(function (organisation) {
                    createOrganisation(organisation, S(organisationsCallback));
                });

                function organisationsCallback(err, result) {
                    if (err && !err.message.match("already exists")) {
                        errors.push(err)
                    } else {
                        createdOrganisations.push(result);
                    }
                    if (createdOrganisations.length+errors.length === defaultOrganisations.length) {
                        if(errors.length>0){
                            callback(errors);
                        }
                        else {
                            callback(undefined,createdOrganisations);
                        }
                    }
                }
            }

            createDefaultOrganisations(function(err,result){
                if(err){
                    console.log("Could not create the default organisations\nErrors:",err,"\nAborting init swarm...")
                }else{
                    console.log("The default organisations were created");
                    self.swarm("createDefaultUsers");
                }
            })
        }
    },
    createDefaultUsers: {
        node: "UsersManager",
        code: function () {
            var self = this;

            function createDefaultUsers(callback) {
                var uuid = require('node-uuid');
                var users = [
                    {
                        userId: new Buffer(uuid.v1()).toString('base64'),
                        password: "swarm",
                        email: "admin@swarm.com",
						firstName: "Admin",
						lastName: "Swarm",
						username: "admin",
						is_active: "true",
						zones: "administrator",
                        avatar: "http://coddify.com/wp-content/uploads/avatar-1.png",
                        organisationId: "SystemAdministrators"
                    }
                ];

                var createdUsers = [];
                var errors = [];

                users.forEach(function (userData) {
                    createUser(userData, S(usersCallback))
                });

                function usersCallback(err, result) {
                    if (err && (err.message.match("already exists")===null)) {
                        errors.push(err)
                    } else {
                        createdUsers.push(result);
                    }
                    
                    if ((createdUsers.length + errors.length) === users.length){
                        if (errors.length > 0) {
                            callback(errors);
                        }
                        else {
                            callback(undefined, createdUsers);
                        }
                    }
                }
            }


            createDefaultUsers(function (errors, result) {
                if (errors && errors.length>0) {
                    console.log("Could not create the default users\nErrors:",errors,"\nAborting init swarm...")
                } else {
                    console.log("The default users were created");
                    // self.swarm("getAdminId");
                }
            });
        }
    },

};

initDatabase;