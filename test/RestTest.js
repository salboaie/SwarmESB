

var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

//globalVerbosity = true;
//swarmSettings.authentificationMethod = "testCtor";
//var client             = util.createClient(adapterHost, adapterPort, "testLoginUser", "ok","testTenant");

//client.startSwarm("LaunchingTest.js","clientCtor");
//client.on("LaunchingTest.js",getGreetings);


//util.wsStartSwarm("localhost", 8000, getGreetings, "intern", "restAuth.js", "start", "ok");
//function getGreetings(obj){
    //host, port, callBack,sessionId, swarmName, ctor
//}


//intern should not be used, is a quick hack, a better session management should be implemented
util.wsStartSwarm("localhost", 8000, getEchoGreetings, "intern", "RemoteEcho.js", "start", 'testParam1', 'testParam2');

var msg = "none";

function getEchoGreetings(obj){
    msg = "OK!";
    console.log(obj);
}

setTimeout (
    function(){
        assert.equal(msg,"OK!");
        process.exit(1);
    },
    1000
);

