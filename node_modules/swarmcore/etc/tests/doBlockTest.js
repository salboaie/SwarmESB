var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("../../nodeClient/NodeClient.js");
var assert              = require('assert');
var client             = util.createClient(adapterHost, adapterPort, "TestUser", "ok","genericTenant", "testCtor");

swarmHub.startSwarm("DoBlockTest.js", "testSuccess");
swarmHub.startSwarm("DoBlockTest.js", "testFail");


swarmHub.on("DoBlockTest.js","successCallDone", countReturns);
swarmHub.on("DoBlockTest.js","successCallFail", countReturns);
swarmHub.on("DoBlockTest.js","successRevived",  countReturns);

var counter = 0;
function countReturns(obj){
    counter++;
    if(counter == 2){
        swarmHub.startSwarm("DoBlockTest.js", "testRevive");
        setTimeout (
            function(){
                assert.equal(counter, 3);
                process.exit(0);
            }, 2000);
    }
}

setTimeout (
    function(){
        assert.equal(counter, 2);
    }, 2000);
