
var logSwarming =
{
    vars:{
        message:"",
        level:"normal",
        sessionId:null,
        userId:null,
        debug:"false"
    },
    err:function(level,message,errText,stack){
        this.nodeName       = thisAdaptor.nodeName;
        this.message        = message;
        this.errText        = errText;
        this.stack          = stack;
        this.level          = level;
        this.swarm("doLog");
    },
    info:function(level,message,details){
        this.nodeName       = thisAdaptor.nodeName;
        this.message        = message;
        this.level          = level;
        this.details        = details;
        this.swarm("doLog");
    },
    doLog:{ //phase that should be replaced. Use your own logging logic
        node:"Logger",
        code : function (){
            cprint("*LOG:[" +this.level + "][" + this.nodeName +"]: "+this.message);
        }
    }
};

logSwarming;