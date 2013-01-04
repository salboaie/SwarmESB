/**
 *
 * Used to start a swarm in another node or session
 *
 */

var startRemoteSwarm =
{
    meta:{
        name:"startRemoteSwarm.js"
    },
    vars:{
        message:"",
        level:"normal",
        userId:null,
        debug:"false"
    },
    start:function(targetAdapter, targetSession, swarmingName, ctorName, responseURI, arguments){
        this.targetAdapter          = targetAdapter;
        this.targetSession          = targetSession;
        this.meta.responseURI       = responseURI;

        if(this.targetSession == null){
            this.targetSession      = this.getSessionId();
        }
        this.setSessionId(this.targetSession);
        this.swarmingName   = swarmingName;
        this.ctorName       = ctorName;
        this.arguments      = arguments;

        this.swarm("findTenant", this.meta.entryAdapter);
    },
    findTenant:{ //phase that should be replaced. Use your own logging logic
        node:"entryAdapter",
        code : function (){
            var o = thisAdapter.findOutlet(this.meta.outletId);
            if(o == undefined){
                logErr("Trying to send a swarm in a wrong session " + this.targetSession);
            } else {
                this.setTenantId(o.getTenantId());
                cprint("Launching in : " + this.targetAdapter);
                this.swarm("launch", this.targetAdapter);
            }
        }
    },
    launch:{ //phase that should be replaced. Use your own logging logic
        node:"*",
        code : function (){
            var args = []; // empty array
            args.push(this.swarmingName);
            args.push(this.ctorName);

            for(var i = 0; i < this.arguments.length; i++){
                args.push(this.arguments[i]);
            }
            startSwarm.apply(thisAdapter,args);
        }
    }
};

startRemoteSwarm;
