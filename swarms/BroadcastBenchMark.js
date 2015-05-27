/**
 * User: sinica
 * Date: 6/7/12
 * Time: 9:49 PM
 * broadcast benchmark example! not really perfect
 * There is a obvious bottleneck in doParallelSwarm
 */
var broadcastBenchmark =
{
    vars:{
        startTime:0,
        tickTackCount:0,
        debug:false
    },
    start:function(phases, tickChunk, useSwarm){
        cprint("Starting Benchmark");
        this.startTime = Date.now();
        this.totalCount = phases;
        this.tickChunk = tickChunk;
        this.useSwarm   = useSwarm;
        console.log("Starting benchmark:", phases, tickChunk, useSwarm);

        this.swarm("counterInit");
    },
    counterInit:{          //phase
        node:"SharedAdapter",
        code : function (){
            var ctxt = getLocalContext("benchmark");
            var self = this;
            ctxt.counter = 0;
            console.log("Starting counting: ", ctxt.counter);
            /*var counter = this.broadcast.async("initTestAdapters", "TestAdapter");
            (function(counter){
                console.log("Starting benchmark for " + this.totalCount + " phases!");
                self.testAdaptersCounter = counter;
                self.swarm("doParallelSwarm");
            }).wait(counter); //not swait!!! */
            this.broadcast("initTestAdapters", "TestAdapter", function(err, counter){
                console.log("Starting benchmark for " + self.totalCount + " phases!");
                self.testAdaptersCounter = counter;
                self.swarm("doParallelSwarm");
            });
        }
    },
    doParallelSwarm:{          //launch as many parallel swarms as possible
        node:"ClientAdapter",
        code : function (){
            this.totalCount         = parseInt(this.totalCount);
            var testAdaptersCounter = parseInt(this.testAdaptersCounter);
            console.log("Found a total of ", testAdaptersCounter, " TestAdapter nodes currently alive",this.useSwarm);
            if(this.useSwarm){
                console.log("using swarm!!!!!");
                for(var i = 0; i < this.totalCount; i++ ){
                    this.swarm("tick");
                }
            } else {
                for(var i = 0; i < this.totalCount/testAdaptersCounter; i++ ){
                    this.broadcast("tick");
                }
            }
        }
    },
    initTestAdapters:{
        node:"TestAdapter",
        code : function (){
            var ctxt = getLocalContext("benchmark"); //not shared between adapters!
            ctxt.counter = 0;
        }
    },
    tick:{  //phase
        node:"TestAdapter",
        do : function (){
            var chunckSize = parseInt(this.tickChunk);
            var ctxt = getLocalContext("benchmark"); //not shared between adapters!
            ctxt.counter++;
            if(ctxt.counter == this.tickChunk){
                ctxt.counter = 0;
                console.log("Tick reset counter at ", this.tickChunk);
                this.swarm("count");
            }
        }
    },
    count:{  //phase
        node:"SharedAdapter",
        code : function (){
            var ctxt            = getLocalContext("benchmark");
            var chunckSize      = parseInt(this.tickChunk);
            var maxCount        = parseInt(this.totalCount);

            ctxt.counter += chunckSize;
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

broadcastBenchmark;