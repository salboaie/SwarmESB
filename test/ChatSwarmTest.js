
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var assert              = require('assert');
var util                = require("swarmutil");

swarmSettings.authentificationMethod = "testCtor";

var roomId = "room-test";
var clients = [];

var client;
for (var i = 0; i < 5; i++) {
    user = "user"+ i;
    client = util.createClient(adaptorHost, adaptorPort, user, "ok", "ChatTestTenant");
    client.on("chat.js", onNewMessage);
    clients.push(client);
}

client = util.createClient(adaptorHost, adaptorPort, "Tester", "ok", "ChatTestTenant");
var getPageclient = util.createClient(adaptorHost, adaptorPort, "PageTester", "ok", "ChatTestTenant");
getPageclient.on("chat.js", onPageReturned);

client.on("chat.js", onNewMessage);
client.startSwarm("chat.js", "deleteRoomMessages", roomId);
client.startSwarm("RoomChatFollow.js", "clean", roomId);

setTimeout(function () {
    client.startSwarm("RoomChatFollow.js","follow", roomId, "Tester");
    client.startSwarm("RoomChatFollow.js","follow", roomId, "FakeTester2");
    cprint(" is following ");
}, 2000);


setTimeout(function () {
    for (var i = 0; i < 5; i++) {
        user = "user"+ i;
        clients[i].startSwarm("chat.js", "newMessage", roomId, user, new Date(), "I am " + user);
    }
    cprint(" is chatting ");
}, 3000);


setTimeout(function () {
    getPageclient.startSwarm("chat.js", "getPage",roomId,0, 10);
    cprint(" is requesting page ");
}, 4000);


var newMessageCount        = 0;
var messageCountInPage  = 0;

function onPageReturned(obj){
    cprint("onPageReturned:" + J(obj));
    messageCountInPage++;
}

function onNewMessage(obj){
    cprint("onNewMessage:" + J(obj));
    newMessageCount++;
}

setTimeout(function () {
    assert.equal(newMessageCount,5)
    //assert.equal(messageCountInPage,1);
    process.exit(1);
}, 5000);