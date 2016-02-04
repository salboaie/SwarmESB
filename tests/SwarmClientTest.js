
var adapterPort     = 3000;
var adapterHost     = "localhost";
var util            = require("swarmcore");
var assert          = require('double-check').assert;
globalVerbosity     = false;

var client2 = util.createClient(adapterHost, adapterPort, "Client2", "ok","SwarmClientTest", "testCtor");
var client1 = util.createClient(adapterHost, adapterPort, "Client1", "ok","SwarmClientTest", "testCtor");
var client3 = util.createClient(adapterHost, adapterPort, "Client3", "ok","SwarmClientTest", "testCtor");
var client4 = util.createClient(adapterHost, adapterPort, "Client4", "!ok","SwarmClientTest", "testCtor");




function testGoodLogin(client, name){
    return function(callback){
        client.on("login.js",function(swarm){
            assert.true(swarm.authenticated);
            callback();
            client.logout();
        });
        client.on("close",function(swarm){
            //assert.true(swarm.authenticated);
            client.logout();
        });
    }
}


function testFailedLogin(client, name){
    return function(callback){
        client.on("login.js", function(swarm){
            //console.log(swarm);
            assert.false(swarm.authenticated);
            callback();
            client.logout();
        });
        client.on("close", function(swarm){
            assert.false(swarm.authenticated);
            client.logout();
        });
    }
}

assert.callback("Test success login for client 1", testGoodLogin  (client1, "client1"));
assert.callback("Test success login for client 2", testGoodLogin  (client2, "client2"));
assert.callback("Test success login for client 3", testGoodLogin  (client3, "client3"));
assert.callback("Test failed login for client  4", testFailedLogin(client4, "client4"));
