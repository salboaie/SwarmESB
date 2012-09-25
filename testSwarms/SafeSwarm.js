/*
   - swarm that testing safeSwarm primitive
 */
var safeSwarmTest = {
    meta:{
        debug:false,
        onError:"onError",
        onSucces:"onSucces"
    },
    vars:{

    },
    start:function () {
        this.safeSwarm("runFail","Null*",100,3); //it will not respond properly
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
            this.answear = "failure";
            this.swarm("failure",this.currentSession());
            this.safeSwarm("failure",this.currentSession());
        }
    },
    onSucces: {
        node: "*",
        code: function () {
            this.answear = "succes";
            this.swarm("succes",this.currentSession());
            this.safeSwarm("succes",this.currentSession());
        }
    }
}

safeSwarmTest;