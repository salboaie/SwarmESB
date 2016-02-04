var adapterPort         = 3000;
var adapterHost         = "localhost";
var assert              = require('double-check').assert;
var util                = require("swarmcore");

var client             = util.createClient(adapterHost, adapterPort, "BenchmarkUser", "ok","BenchmarkTest", "testCtor");


assert.callback("Benchmark should finish and print a result", function(callback){
    client.startSwarm("BenchMark.js","start",1024);

    client.on("BenchMark.js",function(swarm){
        console.log(swarm.result);
        assert.equal(swarm.meta.currentPhase,"results");
        callback();
        client.logout();
    });

})
