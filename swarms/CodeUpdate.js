
var codeUpdateSwarming =
{
    vars:{
        debug:"true1"
    },
    swarmChanged:function(swarmName){
        this.reloadingSwarmName = swarmName;
        this.swarm("dispatchRefresh");
    },
    register:function(adapterName){
        this.adapterName = adapterName;
        this.swarm("doRegister");
    },
    doRegister:{ //phase that should be replaced. Use your own logging logic
        node:"Core",
        code : function (){
            var ctxt = getContext("System:RegisteredAdapters",true);
            ctxt[this.adapterName] = this.adapterName;
        }
    },
    dispatchRefresh:{ //phase that should be replaced. Use your own logging logic
    node:"Core",
        code : function (){

            var ctxt = getContext("System:RegisteredAdapters",true);
            for(var key in ctxt){
                this.swarm("reloadSwarm",key);
            }
        }
    },
    reloadSwarm:{ //running in all adapters
        node:"",
        code : function (){
            //console.log("* Reloading swarm " + this.reloadingSwarmName);
            thisAdapter.reloadSwarm(this.reloadingSwarmName );
        }
    }
};

codeUpdateSwarming;