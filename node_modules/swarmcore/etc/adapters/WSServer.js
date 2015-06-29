var go      = require('../../lib/GenericOutlet.js');

//global sessionsRegistry object
sessionsRegistry  = require("../../lib/SessionRegistry.js").getRegistry();
globalVerbosity = true;

var serverSocketAvailable = true;

thisAdapter = require ("../../lib/SwarmCore.js").createAdapter("WSServer");

thisAdapter.loginSwarmingName = "login.js";
thisAdapter.joinGroup("@ClientAdapters");

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


function sendFunction(socket, data) {
    dprint("Sending: " + M(data));
    socket.send(data);
}

function closeFunction(socket) {
    try{
        console.log("Closing socket");
        socket.close();
        //socket.close();
    } catch (e) {
        console.log("Closing socket error:" + e);
    }
}

function watchSocket(socket, outlet) {
    socket.on('message', function (data) {
        //console.log(data);
        //data = JSON.parse(data);
        dprint("Received: " + M(data));
        outlet.executeFromSocket(data);
    });
}

/*
 Useful for monitoring this type of adapters
 */
adapterStateCheck = function (data) {
    return {ok: serverSocketAvailable, details: socketDetails, requireRestart: !serverSocketAvailable};
}


function socketIOHandler(socket) {
    cprint("Socket IO new socket");
    socket.getClientIp = function(){
        return socket._socket.remoteAddress;
        return socket.upgradeReq.connection.remoteAddress;
    }

    var outlet = go.newOutlet(socket, sendFunction, closeFunction);

    socket.on('error', function(err){
        outlet.onCommunicationError(" receviving error"+err+ err.stack);
    });
    socket.on('close', function(){
        outlet.onCommunicationError(" socket closed ");
    });
    socket.on('disconnect', function(){
        outlet.onCommunicationError(" socket disconnect ");
    });

    watchSocket(socket, outlet);
    outlet.onHostReady();
}

var myCfg = getMyConfig("WSServer");
var serverPort = 8080;
var serverHost = "localhost";
var __wwwroot = "/tmp";



if (myCfg.port != undefined) {
    serverPort = myCfg.port;
}

if (myCfg.wwwroot != undefined) {
    __dirname = myCfg.wwwroot;
}

console.log("Listening on port", serverPort);
/*     if (myCfg.bindAddress != undefined) {
            serverHost = myCfg.bindAddress;
            serverHost = serverHost.trim();
            if (serverHost.length == 0 || serverHost == '*') {
                serverHost = null;
            }
        }
*/

function initSocketIO() {
    function handler (req, res) {
        fs.readFile(__wwwroot + '/index.html',
            function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }

                res.writeHead(200);
                res.end(data);
            });
    }

    var app = require('http').createServer(handler)
    var io = require('socket.io')(app);
    var fs = require('fs');
    app.listen(serverPort);
    io.on('connection', socketIOHandler);

    /* implementation using ws module (obsolete, not performant!?)
        var WebSocketServer = require('ws').Server;
        io = new WebSocketServer({port: serverPort});
         io.on('connection', wssocketIOHandler);
     */
    }

initSocketIO();

/* alternative implementtion
 function wssocketIOHandler(socket) {
 cprint("Socket IO new socket");
 socket.getClientIp = function(){
 return socket._socket.remoteAddress;
 return socket.upgradeReq.connection.remoteAddress;
 }

 var outlet = go.newOutlet(socket, sendFunction, closeFunction);

 socket.on('error', function(){
 outlet.onCommunicationError(" unknown error");
 });
 socket.on('close', function(){
 outlet.onCommunicationError(" socket closed ");
 });
 socket.on('disconnect', function(){
 outlet.onCommunicationError(" socket disconnect ");
 });

 watchSocket(socket, outlet);
 outlet.onHostReady();
 }
 */