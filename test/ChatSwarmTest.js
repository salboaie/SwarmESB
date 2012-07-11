
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var assert              = require('assert');
var util                = require("swarmutil");


var client1             = util.createClient(adaptorHost, adaptorPort,"sess1", "user1", "ok");
var client2             = util.createClient(adaptorHost, adaptorPort,"sess2", "user2", "ok");
var client3             = util.createClient(adaptorHost, adaptorPort,"sess3", "user3", "ok");
var client4             = util.createClient(adaptorHost, adaptorPort,"sess4", "user4", "ok");


var roomId = "room1";
var userId = "Client1";
var date = new Date();
var message ="Hello from chat !";
var userFriendlyRoomName = "room1";

client1.startSwarm("chat.js","ctorNewMessage",roomId,"user1",date,"message1","blueRoom");
client2.startSwarm("chat.js","ctorNewMessage",roomId,"user2",date,"message2","blueRoom");
client3.startSwarm("chat.js","ctorNewMessage",roomId,"user3",date,"message3","blueRoom");
client4.startSwarm("chat.js","ctorNewMessage",roomId,"user4",date,"message4","blueRoom");

client1.on("chat.js",getGreetings.bind(client1));
client2.on("chat.js",getGreetings.bind(client2));
client3.on("chat.js",getGreetings.bind(client3));
client4.on("chat.js",getGreetings.bind(client4));

function getGreetings(obj){
    if(obj.currentPhase == "notifyChatMessage"){
        console.log(this.sessionId + " got message:" + obj.message);
    }
}

setTimeout(function () {
    process.exit(1);
}, 3000);