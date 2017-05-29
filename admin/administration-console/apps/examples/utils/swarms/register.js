var registerSwarming = {

    registerNewUser: function (newUserData) {
        // console.log(newUserData);
        console.log("New user register request", newUserData);
        this.newUser = newUserData;
        this.swarm("verifyUserData");
    },


    verifyUserData: {
        node: "UsersManager",
        code: function () {
            var self = this;
            newUserIsValid(self.newUser, S(function (err, user) {
                if (err) {
                    console.log(err);
                    self.status = "error";
                    self.error = err.message;
                    self.newUser = {};
                    self.home("error");
                } else {
                    self.user = user;

                    startSwarm("emails.js", "sendEmail", "no-reply@" + thisAdapter.config.Core.operandoHost,
                        user['email'],
                        "Activate account",
                        "Your account has been registered \nTo activate it, please access the following link:\n http://" + thisAdapter.config.Core.operandoHost + "/activate/?confirmation_code=" + user.activationCode);
                    self.swarm("setUserNotifications");
                }    
            }))
        }
    },

    setUserNotifications:{
          node:"NotificationUAM",
          code:function(){
              var self = this;
              generateSignupNotifications(this.user.userId, S(function(err, notifications){
                  if(err){
                      console.log(err);
                      self.error = err.message;
                      self.home('error');
                  }
                  self.swarm("setRealIdentity");
              }));
          }
    },

    setRealIdentity :{
        node:"IdentityManager",
        code:function(){
            var self = this;
            setRealIdentity(this.user, S(function(err, identity){
                if(err){
                    console.log(err);
                    self.error = err.message;
                    self.home('error');
                }
                else{
                    console.log("Real identity added", identity);
                    self.home("success");
                }
            }));
        }
    },

    verifyValidationCode: function (validationCode) {
        this.validationCode = validationCode;
        this.swarm("validateCode");
    },

    validateCode:{
        node:"UsersManager",
        code:function(){
            var self = this;
            activateUser(this.validationCode, S(function (err, result) {
                if (err) {                      
                    console.log(err);
                    self.error = err.message;
                    self.home("failed");
                } else {
                    self.home("success");
                }
            }))
        }
    },

    sendActivationCode:function (userEmail) {
        this.email = userEmail;
        this.swarm("getActivationCode");
    },
    getActivationCode:{
        node:"UsersManager",
        code:function(){
            var self = this;
            getUserId(self.email,S(function(err,userId){
                if (err) {
                    self.error = err.message;
                    self.home("failed");
                } else {
                    getUserInfo(userId,S(function(err,user){
                        if (err) {
                            self.error = err.message;
                            self.home("failed");
                        }else if(user.activationCode=="0"){   //  0=="0"  is true
                            self.error = "Account already activated";
                            self.home("failed");
                        }else {
                                startSwarm("emails.js", "sendEmail", "no-reply@" + thisAdapter.config.Core.operandoHost,
                                    user['email'],
                                    "Activate account",
                                    "Your account has been registered \nTo activate it, please access the following link:\n http://" + thisAdapter.config.Core.operandoHost + "/activate/?confirmation_code=" + user.activationCode);
                                self.home("success");
                            }
                        }
                    ))
                }
            }))
        }
    }
}


registerSwarming;