
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

swarmSettings.authentificationMethod = "testCtor";
var client             = util.createClient(adaptorHost, adaptorPort, "UserForGeneratePDFSwarmTest", "ok","UserForGeneratePDFSwarmTest");

client.startSwarm("DocumentConvertorSwarm.js","ctorConvertDocument");
client.on("DocumentConvertorSwarm.js",getGreetings);

var msg = "";

function getGreetings(obj){
    console.log(obj.message);
}

