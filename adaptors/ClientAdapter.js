/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 * To change this template use File | Settings | File Templates.
 */

var redisHost;
var redisPort;

var sutil = require('swarmutil');

thisAdapter = sutil.createAdapter("ClientAdapter",null,null,true);
thisAdapter.loginSwarmingName   = "login.js";
//globalVerbosity = true;

var myCfg = getMyConfig();
var serverPort      = 3000;
var serverHost      =  "localhost";

if(myCfg.port != undefined){
    serverPort = myCfg.port;
}

if(myCfg.bindAddress != undefined){
    serverHost = myCfg.bindAddress;
}
new ClientTcpServer(serverPort,serverHost);

function ClientTcpServer(port,host){
    console.log("ClientAdapter is starting a server on port 3000");
    var net   	= require('net');
    this.server = net.createServer(
        function (socket){
            sutil.newOutlet(socket,loginCallback);
        }
    );
    this.server.listen(port,host);
};

var map = {};
function loginCallback(outlet){
    map[outlet.userId] = outlet;
}

findConnectedClientByUserId = function (userId){
    var o = map[userId];
    if(o != null && o != undefined){
        return o.sessionId;
    }
    cprint("No session for " + userId);
    return "Null*";
}


findOutlet = function (sessionId) {
    return thisAdapter.connectedOutlets[sessionId];
}


renameSession = function (sessionId, forceId,onSubscribe) {
    var outlet = thisAdapter.connectedOutlets[sessionId];
    thisAdapter.connectedOutlets[forceId] = outlet;
    outlet.renameSession(forceId,onSubscribe);
}

var net = require("net");

net.createServer(
    function(socket){
        writePolicy(socket);
    }
).listen(843);


