/**
 * User: sinica
 * Date: 6/7/12
 * Time: 9:49 PM
 */
var benchmark =     //swarming description
{
        vars:{
            maxCount:0,
            startTime:0,
            tickTackCount:0,
            debug:"true1"
        },
        ctor:function(phases){
                    this.startTime = Date.now();
                    this.maxCount = phases/2;
                    console.log("Starting benchmark for " + phases + " phases!");
                    for(var i=0;i< phases/6;i++){
                        this.swarm("tickCore");
                        this.swarm("tackLogger");
                        this.swarm("clank");
                    }
                },
        tickCore:{          //phase
            node:"Core",
            code : function (){
                    this.swarm("count");
                }
        },
        tackLogger:{  //phase
            node:"Logger",
            code : function (){
                this.swarm("count");
            }
        },
        clank:{  //phase
            node:"ClientAdaptor",
                code : function (){
                this.swarm("count");
            }
        },
        count:{  //phase
        node:"SharedAdaptor",
            code : function (){
                incr("benchmark","counter");
                var v           = get("benchmark","counter");
                this.maxCount   = parseInt(this.maxCount);
                if(v >= this.maxCount){
                    this.swarm("printResults");
                }
            }
        },
        printResults:{ //final phase
            node:"Logger",
            code : function (){
                var ct = Date.now();
                var max = parseInt(this.maxCount);
                var diff = (ct - parseInt(this.startTime))/1000;

                var speed = "Not enough phases requested!";
                if(diff != 0){
                    speed = "" + Math.ceil(2*max / diff) + " phases per second!";
                }

                console.log("Benchmark results: " + speed + " Time spent: " + diff + "seconds ");
            }
        }
};

benchmark;