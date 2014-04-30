/*
   - swarm that testing safeSwarm primitive
 */
var SafeSwarm = {
    meta:{
        name:"SafeSwarm.js",
        debug:false,
        onError:"onError",
        onSucces:"onSucces"
    },
    vars:{

    },
    start:function () {
        this.safeSwarm("runFail","Null*",100,5); //it will not respond properly
        this.safeSwarm("runSucces");
        this.safeSwarm("runSucces");
    },
    runSucces:{
        node:"Core",
        code:function () {
            //do nothing but onSucces will get called
        }
    },
    onError: {
        node: "*",
        code: function () {
            this.answear = "failure";
            this.swarm("failure",this.currentSession());
        }
    },
    onSucces: {
        node: "*",
        code: function () {
            this.answear = "succes";
            this.swarm("succes",this.currentSession());
            //this.safeSwarm("succes",this.currentSession());
        }
    }
}

SafeSwarm;