/**
 * Do logging
 *
 */
var logSwarming =
{
    meta:{
        name:"log.js"
    },
    vars:{
        message:"",
        level:"normal",
        userId:null,
        debug:"false"
    },
    err:function(level,message,errText,stack,forSwarm){
        this.nodeName       = thisAdapter.nodeName;
        this.setSessionId(getCurrentSession());
        this.forSwarm       = forSwarm;
        this.message        = message;
        this.errText        = errText;
        this.stack          = stack;
        this.level          = level;
        this.swarm("doLog");
    },
    info:function(level,message,details,forSwarm){
        this.nodeName       = thisAdapter.nodeName;
        this.setSessionId(getCurrentSession());
        this.forSwarm       = forSwarm;
        this.message        = message;

        this.level          = level;
        if(level == "info"){
            this.level = "info ";
        }
        this.details        = details;
        this.swarm("doLog");
    },
    doLog:{ //phase that should be replaced. Use your own logging logic
        node:"Logger",
        code : function (){
            //cprint(this.level + " :[Node:" + this.nodeName+"] [Swarm:"+ this.forSwarm +"] [Tenant:"+ this.meta.tenantId +"] [Session:"+ this.meta.sessionId +"] >>>>>>\t MESSAGE: "+this.message);
            var message = "[Swarm:"+ this.forSwarm +"] [Tenant:"+ this.meta.tenantId +"] [Session:"+ this.meta.sessionId +"] >>>>>>\t MESSAGE: "+this.message;
            doLog(this.level, this.nodeName, message);
        }
    }
};

logSwarming;