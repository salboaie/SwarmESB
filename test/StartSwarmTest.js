

var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

swarmSettings.authentificationMethod = "testCtor";
var client             = util.createClient(adapterHost, adapterPort, "UserForStartSwarmTest", "ok","BenchMark");

client.startSwarm("LaunchingTest.js","clientCtor");

client.on("LaunchingTest.js",getGreetings);

var msg = "none";
function getGreetings(obj){
    msg = obj.message;
}


setTimeout (
    function(){
        assert.equal(msg,"Client swarming!");
        process.exit(1);
    },
    1000);