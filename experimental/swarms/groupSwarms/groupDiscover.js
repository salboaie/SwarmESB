/**
 *
 * Sent
 *
 */
var groupDiscover = {
    meta:{
        name:"groupDiscover.js"
    },
    vars:{
    },
    discoverMembers:function(group){
        this.nodeId = thisAdapter.nodeName;
        this.groupName = group;
        this.broadcast("showYourself",group);
    },
    showYourself:{
        node:"@",
        code : function (){
            this.resultId = thisAdapter.nodeName;
            this.swarm("rememberResponse", this.nodeId);
        }
    },
    rememberResponse:{
        code : function (){
            thisAdapter.rememberGroupMember(this.groupName, this.nodeId);
        }
    }
};

groupSessionManagers;