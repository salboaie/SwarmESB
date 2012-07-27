/*
    - Launched when a node is started to make sure that only one adaptor is executing commands
    - Launched also to make active a redundant node

 */
var nodeStart = {
    vars:{
        currentInstanceUID:null,
        debug:null
    },
    boot:function () {
        this.currentInstanceUID = thisAdaptor.instaceUID;
        this.nodeName           = thisAdaptor.nodeName;
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
            if(thisAdaptor.instaceUID !=  this.currentInstanceUID){
                cprint("Because another node with same name got started, this node is going to sleep from now!");
                thisAdaptor.sleepExecution();
            }
        }
    },
    activate: {
        node: "*",
        code: function () {
            if(thisAdaptor.instaceUID !=  this.currentInstanceUID){
                thisAdaptor.sleepExecution();
            }else{
                thisAdaptor.awakeExecution();
            }
        }
    }
}

nodeStart;