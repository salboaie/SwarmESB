
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var assert              = require('assert');
var util                = require("swarmutil");

//globalVerbosity = true;

swarmSettings.authentificationMethod = "testCtor";

var roomId = "room-test";
var user    = "client";

var client1 = util.createClient(adaptorHost, adaptorPort, user, "ok", "ChatTestTenant");

var client2;
var client3;


    client1.on("chat.js", onNewMessage);


    client1.startSwarm("chat.js", "deleteRoomMessages", roomId);
    client1.startSwarm("RoomChatFollow.js", "clean", roomId);

setTimeout(function () {
    client1.startSwarm("RoomChatFollow.js","follow", roomId, user);
    swarmSettings.authentificationMethod = "testForceSessionId";
    client2 = util.createClient(adaptorHost, adaptorPort, user, "testSession", "ChatTestTenant");
    client3 = util.createClient(adaptorHost, adaptorPort, user, "testSession", "ChatTestTenant");
    client2.on("chat.js", onNewMessage);
    client3.on("chat.js", onNewMessage);
}, 200);

setTimeout(function () {
    client2.startSwarm("chat.js", "newMessage", roomId, user, new Date(), "I am superman");
}, 500);


var newMessageCount     = 0;

function onNewMessage(obj){
    assert.equal(obj.message, "I am superman");
    newMessageCount++;
}


setTimeout(function () {
    assert.equal(newMessageCount,3);
    util.delayExit("Success!\n",1000);
}, 1000);
