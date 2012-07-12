
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var assert              = require('assert');
var util                = require("swarmutil");

var roomId = "room1";
var date = new Date();
var message ="Hello from chat !";
var userFriendlyRoomName = "room1";
var user;
var noOfClients = 5;

for (var i = 0; i < noOfClients; i++) {
    user = "user"+ i;
    var client = util.createClient(adaptorHost, adaptorPort, user, "ok");
    client.startSwarm("chat.js", "ctorNewMessage", roomId, user, date, "message "+i, "blueRoom");
    client.startSwarm("Follower.js","ctorFollow", roomId, user);
    client.on("chat.js", getGreetings.bind(client));
}

function getGreetings(obj){
    if(obj.currentPhase == "notifyChatMessage"){
        console.log(this.sessionId + " got message:" + obj.message);
    }
}

setTimeout(function () {
    process.exit(1);
}, 2000);