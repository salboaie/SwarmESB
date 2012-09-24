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
            this.safeSwarm("failure",this.currentSession());
        }
    },
    onSwarmSucces: {
        node: "*",
        code: function () {
            this.node = thisAdapter.nodeName;
            this.safeSwarm("succes",this.currentSession());
        }
    }
}

safeSwarm;