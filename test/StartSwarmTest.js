

var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

globalVerbosity = true;
swarmSettings.authentificationMethod = "testCtor";
var client             = util.createClient(adapterHost, adapterPort, "testLoginUser", "ok","testTenant");

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