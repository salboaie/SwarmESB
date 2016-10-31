var userInfoSwarming =
{
    meta:{
        name:"UserInfo.js"
    },
    vars:{
        userId:null,
        organisationId:null
    },
    info:function(userId){
        this.userId = userId;
        this.swarm("getUserInfo");
    },

    getAllUsers:function(organisationId){
        this.organisationId = organisationId;
        this.swarm("getOrganisationUsers");
    },

    getOrganisationUsers:{
        node:"UsersManager",
        code: function(){
            var self = this;
            queryUsers(organisationId, S(function(err, users){
                if(err){
                    self.err = err;
                    self.swarm("error");

                }
            }));
        }
    },

    getUserInfo:{
        node:"UsersManager",
        code : function (){
            var self = this;
            var user = getUserInfo.async(self.userId);
            (function(user){
                self.result = user;
                self.home("result");
            }).swait(user);
        }
    },

    error:{
        node:"Core",
        code:function(){
            self.err = err;
            this.home("error");
        }

    }


};

userInfoSwarming;