/*
   - swarm that testing startRemoteSwarm
 */
var remoteEcho = {
    meta:{
    },
    vars:{
        echoSource:null
    },
    start:function () {
        cprint("Started remote echo " + this.getSessionId());
        this.echoSource = thisAdapter.nodeName ;
        this.swarm("notify", this.getSessionId());
    }
}

remoteEcho;
