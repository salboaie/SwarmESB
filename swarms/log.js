
var logSwarming =
{
    vars:{
        message:"",
        level:"normal",
        sessionId:null,
        userId:null,
        debug:"false"
    },
    err:function(level,message,errText,stack,forSwarm){
        this.nodeName       = thisAdaptor.nodeName;
        this.sessionId      = getCurrentSession();
        this.forSwarm       = forSwarm;
        this.message        = message;
        this.errText        = errText;
        this.stack          = stack;
        this.level          = level;
        this.swarm("doLog");
    },
    info:function(level,message,details,forSwarm){
        this.nodeName       = thisAdaptor.nodeName;
        this.sessionId      = getCurrentSession();
        this.forSwarm       = forSwarm;
        this.message        = message;
        this.level          = level;
        this.details        = details;
        this.swarm("doLog");
    },
    doLog:{ //phase that should be replaced. Use your own logging logic
        node:"Logger",
        code : function (){
            cprint(this.level + ": [Node:" + this.nodeName+"] [Swarm:"+ this.forSwarm +"] [Tenant:"+ this.tenantId +"] [Session:"+ this.sessionId +"]\n\tMessage: "+this.message+"\n");
        }
    }
};

logSwarming;