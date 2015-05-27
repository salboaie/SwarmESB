/**
 * User: sinica
 * Date: 6/7/12
 * Time: 9:49 PM
 */
var benchmark =     //benchmark example!
{
    vars:{
        startTime:0,
        tickTackCount:0,
        debug:false
    },
    start:function(phases){
        cprint("Starting Benchmark");
        this.startTime = Date.now();
        this.totalCount = phases;
        this.swarm("counterInit");
    },
    counterInit:{          //phase
        node:"SharedAdapter",
        code : function (){
            var ctxt = getLocalContext("benchmark");
            ctxt.counter = 0;
            console.log("Starting counting ", ctxt.counter)
            this.swarm("doParallelSwarm");
        }
    },
    doParallelSwarm:{          //launch as many parallel swarms as possible
        node:"TestAdapter",
        code : function (){
            this.totalCount = parseInt(this.totalCount);
            cprint("Starting benchmark for " + this.totalCount + " phases!");
            var phases = this.totalCount /8; //launch in 4 nodes 2 consecutive phases
            this.maxCount = this.totalCount / 2;

            for(var i=0;i< phases;i++){   //launch swarms in 4 nodes (process)
                this.swarm("tickCore");
                this.swarm("tackLogger");
                this.swarm("clank");
                this.swarm("frank");
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
        node:"TestAdapter",
        code : function (){
            this.swarm("count");
        }
    },
    clank:{  //phase
        node:"ClientAdapter",
        code : function (){
            this.swarm("count");
        }
    },
    frank:{  //phase
        node:"Logger",
        code : function (){
            this.swarm("count");
        }
    },
    count:{  //phase
        node:"SharedAdapter",
        code : function (){
            var ctxt = getLocalContext("benchmark");
            ctxt.counter++;
            var maxCount           = parseInt(this.maxCount);
            if(ctxt.counter == maxCount){
                this.realCount = ctxt.counter;
                this.swarm("printResults");
                removeLocalContext("benchmark")
            }
        }
    },
    printResults:{ //final phase, in the start node to have the same clock
        node:"ClientAdapter",
        code : function (){
            var ct = Date.now();
            var totalCount = parseInt(this.totalCount);
            var diff = (ct - parseInt(this.startTime))/1000;

            var speed = "Not enough phases requested!";
            if(diff != 0){
                speed = "" + Math.ceil(totalCount * 2 / diff) + " phases per second!";
            }

            this.result = "Benchmark results: " + speed + " Time spent: " + diff + "seconds ";
            console.log(this.result);
            this.home("results");
        }
    }
};

benchmark;