
var adapterPort         = 3000;
var adapterHost         = "localhost";
var assert              = require('double-check').assert;
var util                = require("swarmcore");

var client             = util.createClient(adapterHost, adapterPort, "BenchmarkUser", "ok","BenchmarkTest", "testCtor");


assert.begin("Testing file transfers...");

assert.callback("File transfer between Node1 and Node2 ", function(callback){
    client.startSwarm("FileTransferTest.js","startFileTransfer");
    client.on("FileTransferTest.js",getResults);
    var msg = "none";
    function getResults(obj){
        msg = obj.result;
        assert.equal(msg,"Passed");
        callback();
        client.logout();
    }
})
