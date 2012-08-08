
var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

swarmSettings.authentificationMethod = "testCtor";

var client             = util.createClient(adapterHost, adapterPort, "UserForStartSwarmTest", "ok","BalancerTest");


for(var i = 0; i<6;i++){
    client.startSwarm("WorkerSwarm.js","doWork","");
}

client.on("WorkerSwarm.js",getGreetings);

var msg = "none";

function getGreetings(obj){
    msg = obj.result;
    cprint("Work finished in " + obj.selectedWorker);
}

setTimeout (
    function(){
        assert.equal(msg,"succes");
        process.exit(1);
    },
    3000);
