/**
 * Ofera informatii despre utilizatori (atit doctori sau pacienti)
 * ctor: info
 * home phase: result
 */
var userInfoSwarming =
{
    meta:{
        name:"UserInfo.js"
    },
    vars:{
        userId:null
    },
    info:function(userId){
        this.userId = userId;
        this.swarm("getUserInfo");
    },
    getUserInfo:{
        node:"UsersManager",
        code : function (){
            var self = this;
            var user = getUserInfo.async(this.userId);
            (function(user){
                self.result = user;
                self.home("result");
            }).swait(user);
        }
    }
};

userInfoSwarming;