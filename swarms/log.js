
var logSwarming =
{
    vars:{
        message:"",
        level:"normal",
        sessionId:null,
        userId:null,
        debug:"false"
    },
    start:function(message,errText,stack,level,tenantId,sessionId){
        this.message    = message;
        this.errText    = errText;
        this.stack      = stack;
        this.level      = level;
        this.tenantId   = tenantId;
        this.sessionId   = sessionId;
        this.swarm("doLog");
    },
    info:function(message,level,tenantId,sessionId){
        this.message    = message;
        this.level      = level;
        this.tenantId   = tenantId;
        this.sessionId   = sessionId;
        this.swarm("doLog");
    },
    doLog:{ //phase that should be replaced. Use your own logging logic
        node:"Logger",
        code : function (){
            cprint(J(this));
        }
    }
};

logSwarming;