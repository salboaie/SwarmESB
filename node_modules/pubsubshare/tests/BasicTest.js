var psc = require("../relay/relay.js");
var assert = require("double-check").assert;
var util = require("util");

var abhttps  = require("https-auto");


abhttps.cacheOrganisation("ORG1", {
    server:"localhost",
    port:8000
});


assert.begin("Testing basic pub/sub communication with a single node");

var relay1 = psc.createRelay("ORG1", "localhost", 6379, undefined, "localhost", 8000, "tmp", undefined, function(err,res){
    if(err){
        console.log(err.stack);
    }
});
var client = psc.createClient( "localhost", 6379, null, null, function(err,res){

    if(err){
       console.log(err.stack);
    }
});


assert.callback("Should receive a message in local from redis", function(end){
    client.subscribe("local", function(res){
        assert.equal(res.type, "testLocalMessage");
        end();
    });

})




assert.callback("Should receive a message in test_exclamation, routed by the http server", function(end){
    client.subscribe("test_exclamation",function(res){
        assert.equal(res.type, "testMessage");
        end();
    });
})




setTimeout(function(){
    client.publish("local", {type:"testLocalMessage"});
    client.publish(" !ORG1/test_exclamation", {type:"testMessage"});
}, 100);








