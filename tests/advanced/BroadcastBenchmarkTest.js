var adapterPort         = 3000;
var adapterHost         = "localhost";
var assert              = require('double-check').assert;
var util                = require("swarmcore");

var client             = util.createClient(adapterHost, adapterPort, "BenchmarkUser", "ok","BenchmarkTest", "testCtor");

assert.callback("Benchmark should end and return a success message", function(callback){
    client.startSwarm("BroadcastBenchMark.js","start",3000, 100, true);
    client.on("BroadcastBenchMark.js",function(swarm){
        assert.equal(swarm.message,"success");
        callback();
        client.logout();
    });
})
