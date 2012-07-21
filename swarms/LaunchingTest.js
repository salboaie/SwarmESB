/**
 * User: sinica
 * Date: 6/7/12
 * Time: 9:49 PM
 */
var launchingTest =
{
        vars:{
            message:"Hello World",
            debugSwarm:true
        },
        start:function(){
                    logInfo("launch start");
                    this.message+="!";
                    this.swarm("begin");
                },
        clientCtor:function(){
            this.message+="!";
            this.swarm("concatPhase");
        },
        begin:{ //phase
            node:"Core",
            code : function (){
                    logInfo("begin");
                    this.message="Hello World!"+" The swarming has begun! ";
                    this.swarm("endTest");
                }
        },
        endTest:{   //phase
            node:"Logger",
            code : function (){
                    logInfo("print");
                    cprint(this.message);
                }
        },
        concatPhase:{ //phase
        node:"Core",
        code : function (){
            this.message="Client swarming!";
            this.swarm("onClient",this.sessionId);
        },
        onClient:{ //phase
            node:"$client",
            code : null
        }


    }
};

launchingTest;