/*
    Not available yet in Swarm 2.0
*/


var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("../../nodeClient/nodeClient.js");
var assert              = require('assert');

globalVerbosity = true;
swarmSettings.authentificationMethod = "testCtor";
var client             = util.createClient(adapterHost, adapterPort, "testLoginUser", "ok","testTenant");

client.startRemoteSwarm("Core","RemoteEcho.js","start",'testParam1','testParam2');

client.on("RemoteEcho.js",getGreetings);

var msg = "none";
function getGreetings(obj){
    msg = obj.success ;
}

setTimeout (
    function(){
        assert.equal(msg,"OK");
        process.exit(0);
    },
    1000);