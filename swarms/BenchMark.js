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
        start:function(phases){
                    this.startTime = Date.now();
                    this.maxCount = phases;
                    this.swarm("countInit");

                },
        countInit:{          //phase
            node:"SharedAdaptor",
            code : function (){
                var ctxt = getContext("benchmark",true);
                ctxt.counter = 0;
                this.swarm("doParallelSwarm");
            }
        },
        doParallelSwarm:{          //phase
            node:"SharedAdaptor",
            code : function (){
                var phases = parseInt(this.maxCount);
                logInfo("Starting benchmark for " + phases + " phases!");
                for(var i=0;i< phases/6;i++){   //launch parallel swarms
                    this.swarm("tickCore");
                    this.swarm("tackLogger");
                    this.swarm("clank");
                }
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
                var ctxt = getContext("benchmark",true);
                ctxt.counter++;
                var v           = parseInt(this.maxCount);

                if(ctxt.counter >= this.maxCount/2 ){   // we count twice each call to count (because of tick,tack,clank)
                    this.realCount = ctxt.counter;
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
                    speed = "" + Math.ceil(max / diff) + " phases per second!";
                }

                this.result = "Benchmark results: " + speed + " Time spent: " + diff + "seconds " /*+ this.realCount*/
                console.log(this.result);
                this.swarm("results", this.sessionId);
            }
        }
};

benchmark;