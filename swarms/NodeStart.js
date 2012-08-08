/*
    - Launched when a node is started to make sure that only one adapter is executing commands
    - Launched also to make active a redundant node

 */
var nodeStart = {
    vars:{
        currentInstanceUID:null,
        debug:null
    },
    boot:function () {
        this.currentInstanceUID = thisAdapter.instaceUID;
        this.nodeName           = thisAdapter.nodeName;
        this.swarm("heartbeat", this.nodeName);
    },
    activate:function (nodeUID,nodeName ) {
        this.currentInstanceUID = nodeUID;
        this.nodeName = nodeName;
        this.swarm("activate",nodeName);
    },
    heartbeat:{
        node:"*",
        code:function () {
            if(thisAdapter.instaceUID !=  this.currentInstanceUID){
                cprint("Because another node with same name got started, this node is going to sleep from now!");
                thisAdapter.sleepExecution();
            }
        }
    },
    activate: {
        node: "*",
        code: function () {
            if(thisAdapter.instaceUID !=  this.currentInstanceUID){
                thisAdapter.sleepExecution();
            }else{
                thisAdapter.awakeExecution();
            }
        }
    }
}

nodeStart;