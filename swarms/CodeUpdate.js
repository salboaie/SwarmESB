
var codeUpdateSwarming =
{
    vars:{
    },
    swarmChanged:function(swarmName){
        this.reloadingSwarmName = swarmName;
        this.swarm("dispatchRefresh");
    },
    register:function(adapterName){
        this.adapterName = adapterName;
        this.swarm("doRegister");
    },
    doRegister:{
        node:"Core",
        code : function (){
            var ctxt = getGlobalContext("System:RegisteredAdapters");
            ctxt[this.adapterName] = this.adapterName;
        }
    },
    dispatchRefresh:{
    node:"Core",
        code : function (){
            var ctxt = getGlobalContext("System:RegisteredAdapters");
            for(var key in ctxt){
                this.swarm("reloadSwarm",key);
            }
        }
    },
    reloadSwarm:{ //running in all adapters
        node:"",
        code : function (){
            thisAdapter.reloadSwarm(this.reloadingSwarmName );
        }
    }
};

codeUpdateSwarming;