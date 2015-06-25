/**
 * Created by TAC on 6/25/2015.
 */
/*


 */
var broadcast = {
    vars:{
        currentInstanceUID:null,
        debug:null
    },
        start:function () {
            this.requestUID = generateUUID();
            console.log("Starting BroadcastSwarm");

            this.currentInstanceUID = thisAdapter.instaceUID;

         var counter            = this.broadcast.async("heartbeat",undefined);
         var self               = this;
            (function(counter){
                self.counter=counter;
                console.log(counter, "start");
                self.swarm("initCounter");
            }).swait(counter);
    },
    heartbeat:{
        node:"All",
        code:function () {
            console.log("Running in ", thisAdapter.nodeName, thisAdapter.instanceUID);
            //this.swarm("home",this.currentInstanceUID);
            this.swarm("home");
        }
    },
    home: {
        node: "DemoBroadcast",
        code: function () {
                decCounter(this.requestUID);
                if(getCounter(this.requestUID) === 0) {
                    console.log("Running in home ", thisAdapter.nodeName, thisAdapter.instanceUID);
                    this.home("Success");
                }

        }
    },
    initCounter: {
        node: "DemoBroadcast",
        code: function(){
            initCounter(this.requestUID,this.counter);
            if(getCounter(this.requestUID) === 0) {
                console.log("Running in home ", thisAdapter.nodeName, thisAdapter.instanceUID);
                this.home("Success");
            }
        }
    }
}

broadcast;