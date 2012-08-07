/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 * To change this template use File | Settings | File Templates.
 */

var redisHost;
var redisPort;
var serverPort      = 3000;

var sutil = require('swarmutil');

thisAdapter = sutil.createAdaptor("ClientAdaptor");
thisAdapter.loginSwarmingName   = "login.js";
thisAdapter.verbose             = false;


new ClientTcpServer(serverPort);

function ClientTcpServer(port,adaptor){
    console.log("ClientAdaptor is starting a server on port 3000");
    var net   	= require('net');
    this.server = net.createServer(
        function (socket){
            sutil.newOutlet(socket,loginCallback);
        }
    );
    this.server.listen(port);
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
    return "Null*";
}


findOutlet = function (sessionId) {
    return thisAdapter.connectedOutlets[sessionId];
}


var net = require("net");

net.createServer(
    function(socket){
        writePolicy(socket);
    }
).listen(843);


