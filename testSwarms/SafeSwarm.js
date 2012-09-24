/*
   - swarm that testing safeSwarm primitive
 */
var safeSwarmTest = {
    meta:{
        debug:true,
        onError:"onError",
        onSucces:"onSucces"
    },
    vars:{

    },
    start:function () {
        //this.safeSwarm("runFail",100,"Null*",3); //it will not respond properly
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
            cprint("Failure...");
            this.swarm("failure",this.currentSession());
        }
    },
    onSucces: {
        node: "*",
        code: function () {
            cprint("Succes...");
            this.node = thisAdapter.nodeName;
            this.swarm("succes",this.currentSession());
            //this.safeSwarm("succes",this.currentSession());
        }
    }
}

safeSwarmTest;