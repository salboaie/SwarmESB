var host = "localhost";
var port = 3000;
var clientName = "client1";
var pass = "pass";

function receiveCommand(obj){
    if(obj.isOk == true){

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

var roomId = "room1";
var message = "mesaj din client";
var friendlyRoomName = "FriendlyRoom";
var cmd={
    authorisationToken: "ok",
    sessionId: clientName,
    swarmingName:"login.js",
    command:"start",
    commandArguments:[clientName,clientName,pass]
};
clientConnector.writeCommand(cmd);

setTimeout(function() {
    // after 10 sec
    console.log("shutdown");
    process.exit(1);
}, 20000);