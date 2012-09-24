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
                    cprint("Starting single process benchmark");
                    this.startTime = Date.now();
                    this.totalCount = phases;
                    this.counter    = 0;
                    this.swarm("tick");
                },
        tick:{          //phase
            node:"#localSubprocess_tick",
            code : function (){
                    this.swarm("count");
                }
        },
        count:{  //phase
        node:"#localSubprocess_tack",
            code : function (){
                var max           = parseInt(this.totalCount);
                this.counter = parseInt(this.counter);
                this.counter++;
                if(this.counter >= max/2 ){
                    this.swarm("printResults");
                }else{
                    this.swarm("tick");
                }
            }
        },
        printResults:{ //final phase
            node:"Logger",
            code : function (){
                var ct = Date.now();
                var totalCount = parseInt(this.totalCount);
                var diff = (ct - parseInt(this.startTime))/1000;

                var speed = "Not enough phases requested!";
                if(diff != 0){
                    speed = "" + Math.ceil(totalCount / diff) + " phases per second!";
                }

                this.result = "Single process benchmark results: " + speed + " Time spent: " + diff + "seconds ";
                console.log(this.result);
                this.swarm("results", this.sessionId);
            }
        }
};

benchmark;