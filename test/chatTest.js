var host = "localhost";
var port = 3000;
var clientName = "client1";
var pass = "ok";

var roomId = "room1";
var message = "mesaj din client";
var friendlyRoomName = "FriendlyRoom";

function receiveCommand(obj){
    if(obj.isOk == true){
        console.log("Start to chat");
        var chatCmd = {
            sessionId: clientName,
            swarmingName: "chat.js",
            command: "ctorSave",
            commandArguments: [roomId,clientName,new Date(),message, friendlyRoomName]
        }
        clientConnector.writeCommand(chatCmd);
    }
    console.log("Received " + JSON.stringify(obj) +"\n");
}

var clientConnector = require("./ClientConnector.js").createConnection(host,port,clientName,pass,receiveCommand);

