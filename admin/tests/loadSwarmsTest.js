/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("../../nodeClient/nodeClient.js");
var assert              = require('assert');
var client              = util.createClient(adapterHost, adapterPort, "TestUser", "ok","genericTenant", "testCtor");
globalVerbosity = false;

var fread = false;

swarmHub.resetConnection(client);
swarmHub.on("login.js", "success", function(){
    swarmHub.startSwarm('monitorClient.js', 'listSwarms');
});

swarmHub.on('monitorClient.js','listSwarmsDone', function(response){
    console.log(response.swarmList);
    console.log("----------------------------");
    swarmHub.startSwarm('monitorClient.js', 'loadSwarm', 'log.js');
});

swarmHub.on('monitorClient.js','loadSwarmDone', function(response){
    console.log(response.swarmName, response.swarmDescription);
});



setTimeout(function(){
    process.exit(1);
},5000);
