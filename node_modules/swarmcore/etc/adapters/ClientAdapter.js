var go      = require('../../lib/GenericOutlet.js');
var sutil   = require('../../lib/TCPSockUtil.js');

//global sessionsRegistry object
sessionsRegistry  = require("../../lib/SessionRegistry.js").getRegistry();

var serverSocketAvailable = true;

thisAdapter = require ("../../lib/SwarmCore.js").createAdapter("ClientAdapter");

thisAdapter.joinGroup("@ClientAdapters");

globalVerbosity = false;
thisAdapter.loginSwarmingName = "login.js";

/* for monitoring*/
var socketDetails = "";

/*
*  enable outlet for other swarms
*/
enableOutlet = function(swarm){
    var outlet = sessionsRegistry.getTemporarily(swarm.meta.outletId);
    outlet.successfulLogin(swarm);
}


thisAdapter.nativeMiddleware.registerHomeSwarmHandler(function(swarm){
        var outlet = sessionsRegistry.findOutletById(swarm.meta.outletId);
        outlet.onHoney(swarm);
    }
)

/*
 *  disable outlet for other swarms
 */
disableOutlet = function(swarm){
    var outlet = sessionsRegistry.findOutletById(swarm.meta.outletId);
    outlet.destroy(outlet);
}

var myCfg = getMyConfig("ClientAdapter");
var serverPort = 3000;
var serverHost = "localhost";

if (myCfg.port != undefined) {
    serverPort = myCfg.port;
}

if (myCfg.bindAddress != undefined) {
    serverHost = myCfg.bindAddress;
    serverHost = serverHost.trim();
    if (serverHost.length == 0 || serverHost == '*') {
        serverHost = null;
    }
}
new ClientTcpServer(serverPort, serverHost);

function sendFunction(socket, obj) {
    sutil.writeObject(socket, obj);
}

function closeFunction(socket) {
    socket.end();
}

function watchSocket(socket, outlet) {
    var parser = sutil.createFastParser(outlet.executeFromSocket);
    socket.on('data', function (data) {
        var utfData = data.toString('utf8');
        /*if (checkPolicy(utfData, socket)) { //Point to add support for flash sockets if will be required
            return;
        }*/
        parser.parseNewData(utfData);
    });
}

function ClientTcpServer(port, host) {
    console.log("ClientAdapter is starting a TCP server on port " + port);
    var net = require('net');
    this.server = net.createServer(
        function (socket) {
            var outlet = go.newOutlet(socket, sendFunction, closeFunction);
            socket.on('error', function (er) {
                outlet.onCommunicationError(" Socket failure!");
            });

            socket.on('close', function (er) {
                outlet.onCommunicationError(" Server closing! ");
            });
            watchSocket(socket, outlet);
            outlet.onHostReady();
        }
    );
    this.server.listen(port, host);
    this.server.on('error', function (er) {
        var log;
        switch (er.code) {
            case'EPIPE':
                log = 'This socket has been ended by the other party';
                break;
            case 'EADDRINUSE':
                log = 'Address in use, retrying...';
                break;
            default:
                log = er.toString();
                break;
        }
        serverSocketAvailable = false;
        socketDetails = log;
        logger.info("Client adapter server error : " + log);
    });

    this.server.on('close', function (er) {
        serverSocketAvailable = false;
        socketDetails = "Server closed.";
        logger.info("Client adapter close .");
    });
}

/*
    Useful for monitoring this type of adapaters
 */
adapterStateCheck = function (data) {
    return {ok: serverSocketAvailable, details: socketDetails, requireRestart: !serverSocketAvailable};
}

