
var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

swarmSettings.authentificationMethod = "testCtor";

var client             = util.createClient(adapterHost, adapterPort, "BenchmarkUser", "ok","BenchmarkTest");

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
    5000);
