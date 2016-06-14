/**
 *
 * CodeUpdate.js swarm is used by Core to send new code for modified swarms to adapters
 * useful while developing, a bit dangerous in production!
 *
 */
var codeUpdateSwarming = {
    meta:{
        name:"CoreWork.js",
        debug:false
    },
    swarmChanged:function(swarmName){
        this.reloadingSwarmName = swarmName;
        this.broadcast("reloadSwarm");
    },
    register:function(mainGroup, adapterName){
        this.adapterName = adapterName;
        this.mainGroup   = mainGroup;
        this.swarm("doRegister");
    },
    doRegister:{
        node:"Core",
        code : function (){
            console.log("Registering node ", this.adapterName);
            //do nothing.. the node is by default registered in group "All"
            //particular implementations could require more complex monitoring,etc
        }
    },
    reloadSwarm:{ //running in all adapters
        node:"All",
        code : function (){
            console.log("Reloading ", this.reloadingSwarmName + " in ", thisAdapter.nodeName);
            thisAdapter.nativeMiddleware.reloadSwarm(this.reloadingSwarmName);
        }
    }
};

codeUpdateSwarming;