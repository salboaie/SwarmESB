
var codeUpdateSwarming =
{
    vars:{
        debug:"true1"
    },
    swarmChanged:function(swarmName){
        this.reloadingSwarmName = swarmName;
        this.swarm("dispatchRefresh");
    },
    register:function(adaptorName){
        this.adaptorName = adaptorName;
        this.swarm("doRegister");
    },
    doRegister:{ //phase that should be replaced. Use your own logging logic
        node:"Core",
        code : function (){
            var ctxt = getContext("System:RegisteredAdaptors",true);
            ctxt[this.adaptorName] = this.adaptorName;
        }
    },
    dispatchRefresh:{ //phase that should be replaced. Use your own logging logic
    node:"Core",
        code : function (){

            var ctxt = getContext("System:RegisteredAdaptors",true);
            for(var key in ctxt){
                this.swarm("reloadSwarm",key);
            }
        }
    },
    reloadSwarm:{ //running in all adaptors
        node:"",
        code : function (){
            console.log("* Reloading swarm " + this.reloadingSwarmName);
            thisAdaptor.reloadSwarm(this.reloadingSwarmName );
        }
    }
};

codeUpdateSwarming;