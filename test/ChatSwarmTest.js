
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var assert              = require('assert');
var util                = require("swarmutil");

swarmSettings.authentificationMethod = "testCtor";

var roomId = "room-test";
var clients = [];

var client;
for (var i = 0; i <= 3; i++) {
    user = "user"+ i;
    client = util.createClient(adaptorHost, adaptorPort, user, "ok", "ChatTestTenant");
    client.startSwarm("RoomChatFollow.js","follow", roomId, "user3");
    client.on("chat.js", onNewMessage);
    clients.push(client);
}

client = util.createClient(adaptorHost, adaptorPort, "Tester", "ok", "ChatTestTenant");
client.startSwarm("chat.js", "cleanRoom", roomId);


for (var i = 0; i <= 3; i++) {           //clean followers list
    user = "user"+ i;
    clients[i].startSwarm("RoomChatFollow.js","unfollow", roomId, user);
}


for (var i = 0; i <= 3; i++) {
    user = "user"+ i;
    clients[i].startSwarm("RoomChatFollow.js","follow", roomId, user);
}

setTimeout(function () {
    for (var i = 0; i <= 3; i++) {
        user = "user"+ i;
        clients[i].startSwarm("chat.js", "newMessage", roomId, user, new Date(), "I am " + user);
    }
}, 1000);


setTimeout(function () {
    client.on("chat.js", onPageReturned);
    client.startSwarm("chat.js", "getPage",roomId,0, 10);
}, 1000);


var messageCount        = 0;
var messageCountInPage  = 0;

function onPageReturned(obj){
    messageCountInPage++;
}

function onNewMessage(obj){
    messageCount++;
}

setTimeout(function () {
    assert.equal(messageCount,4)
    assert.equal(messageCountInPage,1)
    process.exit(1);
}, 3000);