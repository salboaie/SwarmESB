/**
 * User: sinica
 * Date: 6/7/12
 * Time: 9:49 PM
 */
var benchmark =     //swarming description
{
        vars:{
            count:0,
            maxCount:0,
            startTime:0,
            debug:"true1"
        },
        start:function(maxCount){
                    this.startTime = Date.now();
                    this.maxCount = maxCount;
                    console.log("Starting benchmark for " + maxCount + " phases!");
                    this.swarm("tick");
                },
        tick:{          //phase
            node:"Core",
            code : function (){
                    this.count      = parseInt(this.count);
                    this.maxCount   = parseInt(this.maxCount);
                    this.count++;
                    if(this.count < this.maxCount){
                        //console.log("Core tick "+this.count);
                        this.swarm("ClientAdaptorTick");
                    }
                    else{
                        this.swarm("printResults");
                    }
                }
        },
        ClientAdaptorTick:{  //phase
            node:"ClientAdaptor",
            code : function (){
                this.count      = parseInt(this.count);
                this.maxCount   = parseInt(this.maxCount);
                this.count++;
                //console.log("CA tick "+this.count);
                this.swarm("tick");
            }
        },
        printResults:{ //final phase
            node:"ClientAdaptor",
            code : function (){
                var ct = Date.now();
                var max = parseInt(this.maxCount);
                var diff = (ct - parseInt(this.startTime))/1000;

                var speed = "Not enough phases requested!";
                if(diff != 0){
                    speed = "" + Math.ceil(max / diff) + " phase changes per second!";
                }

                console.log("Benchmark results: " + speed + " Time spent: " + diff + "seconds");
            }
        }
};

benchmark;