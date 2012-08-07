
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var assert              = require('assert');
var util                = require("swarmutil");

var roomId = "room1";
var message ="Hello from chat !";
var userFriendlyRoomName = "room1";
var user;
var noOfClients = 5;
var client;

for (var i = 1; i <= noOfClients; i++) {
    user = "user"+ i;
    client = util.createClient(adaptorHost, adaptorPort, user, "ok");
    client.on("chat.js", getGreetings.bind(client));
    client.startSwarm("chat.js", "ctorNewMessage", roomId, user, new Date(), message + i, "blueRoom");
    client.startSwarm("Follower.js","ctorFollow", roomId, user);
}

// The last client gets all the messages
client = util.createClient(adaptorHost, adaptorPort, "superuser", "ok");
client.on("chat.js", getPage.bind(client));
client.startSwarm("chat.js", "ctorGetPage",roomId,0, 10);


function getPage(obj) {
    if(obj.currentPhase == "pageAnswer"){
        console.log("--------------- PAGE ----------------");
        obj.pageArray.forEach(function(element){
            var j = JSON.parse(element);
            var d = new Date(j.date);
            var date = d.getDate();
            var time = d.getTime();
            console.log(j.userId+ " (" + date+ " | " + time + "):" + j.message);

        });
        console.log("--------------------------------------");
    }
}

function getGreetings(obj){
    if(obj.currentPhase == "notifyChatMessage"){
        console.log(obj.userId + " got message:" + obj.message);
    }
}

setTimeout(function () {
    process.exit(1);
}, 10000);