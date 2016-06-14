/* OBSOLETE, for review and proposed for deletion */

var adapterPort         = 3000;
var adapterHost         = "localhost";
var assert              = require('assert');
var util                = require("../../nodeClient/nodeClient.js");

var client             = util.createClient(adapterHost, adapterPort, "BenchmarkUser", "ok","BenchmarkTest", "testCtor");

client.startSwarm("LargeFileTransferTest.js","startFileTransfer");

client.on("LargeFileTransferTest.js",getGreetings);

var msg = "none";
function getGreetings(obj){
    msg = obj.result;
}

setTimeout (
    function(){
        assert.equal(msg,"Passed");
        process.exit(0);
    },
    2000);