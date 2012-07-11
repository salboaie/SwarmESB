
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');

var client             = util.createClient(adaptorHost, adaptorPort, "user", "ok");



client.startSwarm("LaunchingTest.js","clientCtor");

client.on("LaunchingTest.js",getGreetings);

var msg = "none";
function getGreetings(obj){
    msg = obj.message;
}


setTimeout (
    function(){
        assert.equal(msg,"Client swarming!");
        process.exit(1);
    },
    1000);