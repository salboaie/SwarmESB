/*
   - swarm that testing safeSwarm primitive
 */
var safeSwarm = {
    meta:{
        onErrorPhase:"onError",
        onSuccesPhase:"onSwarmSucces"
    },
    vars:{

    },
    start:function () {
        this.safeSwarm("runFail",100,"Null*",3); //it will not respond properly
        this.safeSwarm("runSucces");
    },
    runSucces:{
        node:"Core",
        code:function () {
            //do nothing but onSwarmSucces will get called
        }
    },
    onError: {
        node: "*",
        code: function () {
            this.swarm("failure",this.sessionId);
        }
    },
    onSwarmSucces: {
        node: "*",
        code: function () {
            this.node = thisAdapter.nodeName;
            this.swarm("succes",this.sessionId);
        }
    }
}

safeSwarm;