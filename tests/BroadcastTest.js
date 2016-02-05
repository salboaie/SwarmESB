var adapterPort         = 3000;
var adapterHost         = "localhost";
var assert              = require('double-check').assert;
var util                = require("swarmcore");

var client             = util.createClient(adapterHost, adapterPort, "BroadcastUser", "ok","BroadcastTest", "testCtor");

assert.begin("Testing broadcasting...");

assert.callback("Broadcast should finish and print a result", function(callback){
    client.startSwarm("BroadcastSwarm.js","start");

    client.on("BroadcastSwarm.js",function(swarm){
        console.log(swarm);
       // assert.equal(swarm.meta.currentPhase,"results");
        callback();
       // client.logout();
    });

})
/**
 * Created by TAC on 6/25/2015.
 */
