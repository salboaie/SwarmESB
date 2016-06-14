/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */

var adapterPort         = 3000;
var adapterHost         = "localhost";
var nutil               = require('util');
var util                = require("../.././nodeClient/nodeClient.js");
var assert              = require('assert');
var client              = util.createClient(adapterHost, adapterPort, "TestUser", "ok","genericTenant", "testCtor");
globalVerbosity = false;

var result = null;

swarmHub.startSwarm("ping.js", "ping");

swarmHub.on("ping.js","done", function(response){
    console.log(response);
});

setTimeout(function(){
    process.exit(1);
},2000);

