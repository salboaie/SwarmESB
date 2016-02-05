var adapterPort         = 3000;
var adapterHost         = "localhost";
var assert              = require('double-check').assert;
var util                = require("swarmcore");

var client             = util.createClient(adapterHost, adapterPort, "BroadcastUser", "ok","BroadcastTest", "testCtor");

assert.begin("Testing broadcasting...");

assert.callback("Broadcast should finish and print a result", function(callback){
    client.startSwarm("ChoreographySwarm.js","start");

    client.on("ChoreographySwarm.js",function(swarm){
        //console.log(swarm);
        assert.equal(swarm.success,true);
        callback();
       // client.logout();
    });

})
