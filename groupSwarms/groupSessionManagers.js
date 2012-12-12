/**
 *
 * CodeUpdate.js swarm is used by Core to send new code for modified swarms to adapters
 * useful while developing, a bit dangerous in production!
 *
 */
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