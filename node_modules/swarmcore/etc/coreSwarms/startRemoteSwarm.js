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
    start:function(targetAdapter, targetSession, swarmingName, ctorName, outletId, arguments){
        this.targetAdapter          = targetAdapter;
        this.targetSession          = targetSession;

        if(outletId){
            this.meta.outletId          = outletId;
        }
        this.meta.entryAdapter      = thisAdapter.nodeName;

        if(this.targetSession == null){
            this.targetSession      = this.getSessionId();
        }

        this.setSessionId(this.targetSession);
        this.swarmingName   = swarmingName;
        this.ctorName       = ctorName;
        this.arguments      = arguments;

        if(!this.meta.outletId){
            logger.info("No outletId was given when starting remote swarm " + swarmingName);
        }

        this.swarm("findTenant");
    },
    findTenant:{
        node:"SessionsRegistry",
        code: function(){
            var tenantId = getTenantForSession(this.targetSession);
            if(tenantId) {
                this.setTenantId(tenantId);
                cprint("Launching remote swarm " + this.swarmingName + " in " + this.targetAdapter);
                this.swarm("launch", this.targetAdapter);
            } else{
                logger.error("Dropping the request of starting swarm \"" +  this.swarmingName + "\" in a unknown session " + this.targetSession);
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
            cprint("Launching for outlet " + this.meta.outletId + " " );
            startSwarm.apply(thisAdapter,args);
        }
    }
};

startRemoteSwarm;
