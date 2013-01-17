

var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

//globalVerbosity = true;
swarmSettings.authentificationMethod = "testForceSessionId";
var client             = util.createClient(adapterHost, adapterPort, "testLoginUser", "testSession","testTenant");

client.startSwarm("LaunchingTest.js","clientCtor");
client.on("LaunchingTest.js",getGreetings);

var msg = "none";
function getGreetings(obj){
    //host, port, callBack,sessionId, swarmName, ctor
    util.wsStartSwarm("localhost", 8000, getEchoGreetings, client.sessionId, "RemoteEcho.js", "start", 'testParam1', 'testParam2');
}

function getEchoGreetings(obj){
    msg = obj.success ;
    console.log(obj);
}

setTimeout (
    function(){
        assert.equal(msg,"OK");
        process.exit(1);
    },
    1000);

