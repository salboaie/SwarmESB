/*
   - swarm that guarantees that a phase was successfully executed
 */
var safeSwarm = {
    meta:{
        safe:true,
        onError:"onError"
    },
    vars:{

    },
    start:function () {
        this.swarm("run");
    },
    run:{
        node:"Core",
        code:function () {
            throw "Intended Error for test";
        }
    },
    onError: {
        node: "*",
        code: function () {
            cprint("Error...");
        }
    }
}

safeSwarm;