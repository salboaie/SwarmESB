
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

swarmSettings.authentificationMethod = "testCtor";

var client             = util.createClient(adaptorHost, adaptorPort, "UserForStartSwarmTest", "ok","StartSwarmTest");


client.startSwarm("BenchMark.js","start",48000);

client.on("BenchMark.js",getGreetings);

var msg = "none";
function getGreetings(obj){
    msg = "succes";
    cprint(obj.result);
}

setTimeout (
    function(){
        assert.equal(msg,"succes");
        process.exit(1);
    },
    3000);
