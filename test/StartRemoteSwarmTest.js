

var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

globalVerbosity = true;
swarmSettings.authentificationMethod = "testCtor";
var client             = util.createClient(adapterHost, adapterPort, "testLoginUser", "ok","testTenant");

client.startRemoteSwarm("Core","RemoteEcho.js","start",'testParam1','testParam2');

client.on("RemoteEcho.js",getGreetings);

var msg = "none";
function getGreetings(obj){
    msg = obj.echoSource;
}

setTimeout (
    function(){
        assert.equal(msg,"Core");
        process.exit(1);
    },
    1000);