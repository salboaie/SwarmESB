
var adaptorPort         = 3000;
var adaptorHost         = "localhost";
var assert              = require('assert');
var util                = require("swarmutil");

//globalVerbosity = true;

swarmSettings.authentificationMethod = "testCtor";

var roomId = "room-test";
var clients = [];

var MULTIPLY = 10;

var MAXCLIENTS = MULTIPLY * 20;

var client;
for (var i = 0; i < MAXCLIENTS; i++) {
    user = "user"+ i;
    client = util.createClient(adaptorHost, adaptorPort, user, "ok", "ChatTestTenant");
    client.on("chat.js", onNewMessage);
    client.on("login.js", countLogins);
    clients.push(client);
}

client = util.createClient(adaptorHost, adaptorPort, "Tester", "ok", "ChatTestTenant");
client.on("login.js", countLogins);
client.on("chat.js", onNewMessage);

var getPageclient = util.createClient(adaptorHost, adaptorPort, "PageTester", "ok", "ChatTestTenant");
getPageclient.on("login.js", countLogins);
getPageclient.on("chat.js", onPageReturned);


client.startSwarm("chat.js", "deleteRoomMessages", roomId);
client.startSwarm("RoomChatFollow.js", "clean", roomId);


setTimeout(function () {
    client.startSwarm("RoomChatFollow.js","follow", roomId, "Tester");
    //client.startSwarm("RoomChatFollow.js","follow", roomId, "FakeTester2");
}, MULTIPLY * 200);


setTimeout(function () {
    for (var i = 0; i < MAXCLIENTS; i++) {
        user = "user"+ i;
        clients[i].startSwarm("chat.js", "newMessage", roomId, user, new Date(), "I am " + user);
    }
}, MULTIPLY * 400);


setTimeout(function () {
    getPageclient.startSwarm("chat.js", "getPage",roomId,0, MAXCLIENTS+1);
}, MULTIPLY * 600);


var newMessageCount     = 0;
var messageCountInPage  = 0;
var loginsCounter       = 0;
var pageSize            = 0;

function onPageReturned(obj){
    //cprint(obj);
    pageSize = obj.pageArray.length;
    messageCountInPage++;
}

function onNewMessage(obj){
    //cprint(obj);
    newMessageCount++;
}

function countLogins(obj){
    //cprint(obj);
    loginsCounter++;
}

setTimeout(function () {
    assert.equal(loginsCounter,MAXCLIENTS + 2);
    assert.equal(messageCountInPage,1);
    assert.equal(pageSize,MAXCLIENTS);
    assert.equal(newMessageCount,MAXCLIENTS);

    util.delayExit("Success!\n",1000);
}, MULTIPLY * 800);
