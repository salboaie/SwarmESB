
var logSwarming =
{
    vars:{
        message:"",
        level:"normal",
        sessionId:null,
        userId:null,
        debug:"false"
    },
    start:function(message,level,userId,sessionId){
        this.message=message;
        this.level = level;
        this.userId     =   userId;
        this.sessionId  =   sessionId;
        this.swarm("doLog");
    },
    doLog:{ //phase that should be replaced. Use your own logging logic
        node:"Logger",
        code : function (){
            print("*Log: "+this.message);
        }
    }
};

logSwarming;