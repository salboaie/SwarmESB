

var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

globalVerbosity = true;
swarmSettings.authentificationMethod = "testCtor";
var client             = util.createClient(adapterHost, adapterPort, "testSafeTestUser", "ok","testTenant");

client.startSwarm("SafeSwarm.js","start");
client.on("SafeSwarm.js",getGreetings);

var msg = "none";
var succesCount     = 0;
var failCount       = 0;
function getGreetings(obj){
    if(obj.answear == "succes"){
        succesCount++;
    }else{
        failCount++;
    }
}


setTimeout (
    function(){
        assert.equal(succesCount,1);
        assert.equal(failCount,1);
        process.exit(1);
    },
    1000);