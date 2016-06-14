var psc = require("../relay/relay.js");
var assert = require("double-check").assert;

assert.begin("Testing basic pub/sub communication between two organisations");


//organisationName, redisHost, redisPort, publicHost, publicPort, keySpath, filesPath
var relay2 = psc.createRelay("ORG2", "localhost", 6380, "localhost", 8001, "tmp2");
var relay1 = psc.createRelay("ORG1", "localhost", 6379, "localhost", 8000, "tmp");


var c2 = psc.createClient("localhost", 6380);

var c1 = psc.createClient("localhost", 6379);



assert.callback("Communication works between organisations", function(end){
    c1.subscribe("testChannel", function(msg, from){
        assert.equal(msg.message, "message");
        end();
    });
})

c2.publish("pubsub://ORG1/testChannel", {message:"message"});


