var adapterPort         = 3000;
var adapterHost         = "localhost";
var util                = require("swarmutil");
var assert              = require('assert');
var client;

swarmSettings.authentificationMethod = "testForceSessionId";


client = util.createClient(adapterHost, adapterPort, "testLoginUser", "testSession","testTenant");
client.startSwarm("LaunchingTest.js","clientCtor");
client.on("LaunchingTest.js",getGreetings);



var date      = new Date();
var roomId    = "room1";
var userId    = "gigel";
var message   = "Un mesaj !";
var objectId  = "objId1";


function getGreetings(obj){
    //sendMessage:function(roomId,userId,date,message,objectId)
    util.wsStartSwarm("localhost", 8000, getEchoGreetings, client.sessionId, "notifications.js", "sendMessage", roomId, userId, date, message, objectId);
}

function getEchoGreetings(obj){
    console.log(obj);

    assert.equal(roomId,  obj.roomId);
    assert.equal(message, obj.message);
    assert.equal(objectId,obj.objectId);

    process.exit(1);
}
