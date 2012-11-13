

var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

//globalVerbosity = true;
swarmSettings.authentificationMethod = "testCtor";
var client             = util.createClient(adapterHost, adapterPort, "testLoginUser", "ok","testTenant");

client.startSwarm("LaunchingTest.js","clientCtor");
client.on("LaunchingTest.js",getGreetings);

var msg = "none";
function getGreetings(obj){
    //host, port, callBack,sessionId, swarmName, ctor
    util.wsStartSwarm("localhost", 8000, getEchoGreetings, client.sessionId, "RemoteEcho.js", "start", 'testParam1', 'testParam2');
}

function getEchoGreetings(obj){
    msg = "OK!";
}

setTimeout (
    function(){
        assert.equal(msg,"OK!");
        process.exit(1);
    },
    1000);

