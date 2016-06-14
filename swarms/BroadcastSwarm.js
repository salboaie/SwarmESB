/**
 * Created by TAC on 6/25/2015.
 */
/*
 BroadcastSwarm is a swarm that checks the availability of each node and returns the number of unavailable nodes.In
 the initial phase (start) the swarm splits into several "little" swarms which are sent to every node in the system
 (hence the field "node" in the heartbeat phase). The function that does the splitting (broadcast) returns the number
 of nodes which should be available not taking into account any failing nodes. At this point the whole thing divides
  into several processes (swarms) each process deployed on a node; they act independently anw will later "join" for the
   final result. One of them is the original swarm which waits on the initial node for the "theoretical" number of
   nodes available as returned by the function broadcast; upon receiving this number it updates the variable counter
   (which will be visible for all the other swarms) and that's pretty much it; The other swarms are sent to every node
   and, after arriving, they swiftly move towards the "meeting point" , the DemoBroadcast node (hence the name of the
   phase... "home"); every one that arrives decrements the number of available nodes (the counter returned by the
   broadcast function); the final result indicates the number of swarms that didn't return... therefore the number
   of unavailable nodes in the network; if the number is 0 you got yourself a fully up and running system... you can
   start doing cool stuff with it.
   The name "heartbeat" used for the second phase is quite descriptive of the whole
   process... the initial swarm sends little swarms to every node in the system and then expects them to come back;
   very similar to the systole-diastole cycle of the heart. (This shows that programmers have a heart)
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
                self.counter = counter;
                console.log(counter, "start");
                self.swarm("initCounter");
            }).swait(counter);
    },
    heartbeat:{
        node:"All",
        code:function () {
            console.log("Running in ", thisAdapter.nodeName, thisAdapter.instanceUID);
            //this.swarm("home",this.currentInstanceUID);
            this.swarm("pong");
        }
    },
    pong: {
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
