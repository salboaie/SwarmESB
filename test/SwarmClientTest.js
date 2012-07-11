
var adaptorPort      = 3000;
var adaptorHost      = "localhost";
var util = require("swarmutil");
var assert = require('assert');

var client1 = util.createClient(adaptorHost, adaptorPort, "Client1", "ok");
var client2 = util.createClient(adaptorHost, adaptorPort, "Client2", "ok");
var client3 = util.createClient(adaptorHost, adaptorPort, "Client3", "ok");
var client4 = util.createClient(adaptorHost, adaptorPort, "Client4", "!ok");

client1.on("login.js",successLogin);
client1.on("close",onClose);

client2.on("login.js",successLogin);
client2.on("close",onClose);

client3.on("login.js",successLogin);
client3.on("close",onClose);

client4.on("login.js",successLogin);
client4.on("close",onClose);

countLogins = 0;
closedLogins = 0;
function successLogin(obj){
    countLogins ++;
}

function onClose(obj){
    assert.equal(obj,client4);
    closedLogins++;
}

setTimeout (
    function(){
        assert.equal(countLogins,3);
        assert.equal(closedLogins,1);
        process.exit(1);
    },
    1000);

