/**
 * Created by salboaie on 3/24/15.
 */
/*
    Swarm pentru administrarea utilizatorilor usmed. Ofera constructorii create, delete, update, usersList
 */

var UserCtrl =
{
    create:function(user){
        this.user         = user;
        console.log("create", this.user);
        this.swarm('createUser');
    },
    delete:function(user){
        this.user         = user;

        this.swarm('deleteUser');
    },
    usersList:function(organisationId){
        this.organisationId = organisationId;
        this.swarm('usersListImpl');
    },
    update:function(userJson){
        this.userJson       = userJson;
        this.swarm('updateUser');
    },
    deleteUser: {
        node: "UsersManager",
        code: function () {
            deleteUser(this.user);
            this.home("userDeleted");
        }
    },
    createUser:{
        node:"UsersManager",
        code: function() {

            var user = createUser.async(this.user);
            var self = this;
            (function(user){
                self.user = user;
                if(user.isDoctor){
                    usmedAcl.addMemberInOrganisation(user.userId, user.organisationId);
                }
                self.home("userCreationDone");
            }).swait(user, function(err){
                    console.log(err);
                    self.home("userCreationFailed");
                });
        }
    },
    updateUser:{
        node:"UsersManager",
        code: function(){
            var user = updateUser.async(this.userJson);
            var self = this;
            (function(user){
                self.user = user;
                self.home("saveDone");
            }).swait(user, function(err){
                console.log(err);
                self.home("userUpdateFailed");
            });
        }
    },
    usersListImpl:{
        node:"UsersManager",
        code: function() {
            var userList = queryUsers.async(this.organisationId);
            var self = this;
            (function(userList){
                self.userList = userList;
                self.home("userListDone");
            }).swait(userList);
        }
    }
};

UserCtrl;
