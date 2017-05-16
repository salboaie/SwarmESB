

var adapterPort         = 3000;
var adapterHost         = "localhost";
globalVerbosity = false;
var assert              = require('double-check').assert;

var util       = require("swarmcore");

var client     = util.createClient(adapterHost, adapterPort, "testLoginUser", "ok","testTenant", "testCtor");

assert.begin('Running the Start Swarm test');
assert.callback("LaunchingTest swarm should greet back (testing home primitive)", function(callback){
    client.startSwarm("LaunchingTest.js","clientCtor","Hello World Rafael");
    swarmHub.on("LaunchingTest.js","onClient", function(swarm){
        assert.equal(swarm.message,"Client swarming!");
        callback();
        client.logout();
    });

})
