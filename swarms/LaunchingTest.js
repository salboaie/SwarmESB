/**
 * User: sinica
 * Date: 6/7/12
 * Time: 9:49 PM
 */
var launchingTest =
{
        meta:{
            noMeta:true,
            debug :"false"
        },
        vars:{
            message:"Hello World"
        },
        start:function(){
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
                    this.message="Hello World!"+" The swarming has begun! ";
                    this.swarm("endTest");
                }
        },
        endTest:{   //phase
            node:"Logger",
            code : function (){
                    cprint(this.message);
                }
        },
        concatPhase:{ //phase
        node:"Core",
        code : function (){
            this.message="Client swarming!";
            this.home("onClient");
        }
    }
};

launchingTest;