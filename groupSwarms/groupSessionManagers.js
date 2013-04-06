
var groupSessionManagers = {
    meta:{
        name:"groupSessionManagers.js"
    },
    vars:{
    },
    register:function(groupName, nodeId){
        this.groupName  = groupName;
        this.nodeId     = nodeId;
        this.broadcast("nodeStarted");
    },
    nodeStarted:{
        node:"@SessionManagers",
        code : function (){
            thisAdapter.addGroupMember(this.groupName, this.nodeId);
        }
    }
};

groupSessionManagers;