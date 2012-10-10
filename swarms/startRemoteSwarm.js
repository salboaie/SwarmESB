
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
    start:function(targetAdapter, targetSession, swarmingName, ctorName, calback, arguments){
        this.targetAdapter  = targetAdapter;
        this.targetSession  = targetSession;
        this.swarmingName   = swarmingName;
        this.ctorName       = ctorName;
        this.calback        = calback;
        this.arguments      = arguments;
        this.swarm("findTenant");
    },
    findTenant:{ //phase that should be replaced. Use your own logging logic
        node:"ClientAdapter",
        code : function (){
            var o = findOutlet(this.targetSession);
            this.setTenantId(o.getTenantId());
            this.swarm("launch",targetAdapter);
        }
    },
    launch:{ //phase that should be replaced. Use your own logging logic
        node:"ClientAdapter",
        code : function (){
            var args = []; // empty array
            args.push(this.swarmingName);
            args.push(this.ctorName);

            for(var i = 0; i < this.arguments.length; i++){
                args.push(this.arguments[i]);
            }
            startSwarm.call(thisAdapter,args);
        }
    }
};

startRemoteSwarm;