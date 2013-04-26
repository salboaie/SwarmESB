/*
Group benchmark: send as many swarms as possible to a big number of nodes
    Configure Launcher adapter on as many computers as possible and start a number of workers,
    similar with the number of CPU cores
    This swarm will automatically make pairs of nodes.
    The first member of the pair will send swarms towards its pair as fast as possible.
    The other member will receive and count them.
 */

var benchmark =
{
        vars:{
            startTime:0,
            tickTackCount:0,
            debug:false
        },
        start:function(phases){
                    cprint("Starting Group Benchmark with " + phases + " phases");
                    this.startTime = Date.now();
                    this.totalCount = phases;
                    this.swarm("counterInit");
                },
        counterInit:{          //phase
            node:"SharedAdapter",
            code : function (){
                logInfo("Resetting counter");
                var ctxt = getContext("GroupBenchmark");
                ctxt.counter = 0;
                this.swarm("choosePairs");
            }
        },
        choosePairs:{
            node:"@WorkersGroup",
            code : function (){
                var members = thisAdapter.getGroupMembers();
                var pairsNumber = members.length/2;
                console.log("GroupBenchmark with " + pairsNumber + " pairs of nodes");
                this.burstCounter = this.totalCount / pairsNumber);
                for(var i=0; i < pairsNumber ; i++){
                    this.myPair = members[i];
                    this.swarm("ping",members[members.length - i]);
                }
            }
        },
        ping:{          //launch burstCounter phases as fast as possible
            node:"*",
            code : function (){
                this.burstCounter = parseInt(this.burstCounter);
                //logInfo("Starting benchmark for " + this.totalCount + " phases!");

                for(var i=0;i< this.burstCounter; i++){
                    this.swarm("pong", this.myPair);
                }
            }
        },
        pong:{
            node:"*",
            code : function (){
                var ctxt = getContext("GroupBenchmark");
                if(ctxt.counter == undefined){
                    ctxt.counter = 0;
                }
                ctxt.counter++;
                this.burstCounter = parseInt(this.burstCounter);
                if(ctxt.counter >= this.burstCounter){
                    this.swarm("countJoin");
                }
            }
        },
        countJoin:{  //phase
        node:"SharedAdapter",
            code : function (){
                this.burstCounter = parseInt(this.burstCounter);
                var ctxt = getContext("GroupBenchmark");
                ctxt.counter += this.burstCounter;
                this.maxCount  = parseInt(this.maxCount);
                if(ctxt.counter >= this.maxCount ){
                    this.realCount = ctxt.counter;
                    this.swarm("printResults");
                }
            }
        },
        printResults:{
            node:"Logger",
            code : function (){
                var ct = Date.now();
                var totalCount = parseInt(this.totalCount);
                var diff = (ct - parseInt(this.startTime))/1000;

                var speed = "Not enough phases requested!";
                if(diff != 0){
                    speed = "" + Math.ceil(totalCount / diff) + " phases per second!";
                }
                this.result = "Benchmark results: " + speed + " Time spent: " + diff + "seconds ";
                console.log(this.result);
                this.home("results");
                this.broadcast("verifyCounting");
            }
        },
        verifyCounting:{
            node:"@WorkersGroup",
            code : function (){
                var ctxt = getContext("GroupBenchmark");
                this.burstCounter = parseInt(this.burstCounter);
                if(ctxt.counter == undefined || ctxt.counter != this.burstCounter){
                    console.log("Detected a node who was not participating " + thisAdapter.nodeName);
                }
            }
        }
};

benchmark;