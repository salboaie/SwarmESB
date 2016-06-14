/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */

var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("../.././nodeClient/nodeClient.js");
var assert              = require('assert');
var client              = util.createClient(adapterHost, adapterPort, "TestUser", "ok","genericTenant", "testCtor");
globalVerbosity = false;

var fread = false;

swarmHub.resetConnection(client);
swarmHub.on("login.js", "success", function(){
    console.log('login success');
    swarmHub.startSwarm("logUtils.js", "list");
});

swarmHub.on("logUtils.js","doneList", function(response){
    console.log(response.files, response.loggerId, response.systemId);
    console.log("----------------------------");
    if (!fread && response.files && response.files.length > 0) {
        fread = true;
        var fName = response.files[0];
        console.log('reading file', fName, response.loggerId);
        swarmHub.startSwarm("logUtils.js", "read", response.loggerId, fName);
    }
    
});

swarmHub.on("logUtils.js","doneRead", function(response){
    console.log(response.fileName, response.content);
});



setTimeout(function(){
    process.exit(1);
},5000);
