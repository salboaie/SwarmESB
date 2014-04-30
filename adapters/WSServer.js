/**********************************************************************************************
 * Web Socket server side adapter for SwarmESB
 **********************************************************************************************/
var sutil = require('swarmutil');
var util = require('util');
var fs = require('fs');
thisAdapter = sutil.createAdapter("WSServer", null, null, false);
thisAdapter.loginSwarmingName = "login.js";
/**********************************************************************************************
 * Variables
 **********************************************************************************************/
var go = require('../core/GenericOutlet.js');


globalVerbosity = true;

var config;
var serverPort;
var serverHost;
var baseFolder;
var file;
var app;
var io;

/**********************************************************************************************
 * Functions
 **********************************************************************************************/

init();

function init() {
    processConfig();
    //initStaticServer();
    initSocketIO();
};

function processConfig() {
    config = getMyConfig();
    if (config.port != undefined) {
        serverPort = config.port;
    }
    if (config.bindAddress != undefined) {
        serverHost = config.bindAddress.trim();
        if (serverHost.length == 0 || serverHost == '*') {
            serverHost = null;
        }
    }
    if (config.home != undefined && config.home != "") {
        baseFolder = config.home;
    } else {
        cprint("\'home\' property should be defined for SwarmHttpServer");
        process.exit();
    }
}


function initSocketIO() {
    var WebSocketServer = require('ws').Server;
    io = new WebSocketServer({port: config.port});
    io.on('connection', socketIOHandler);
}


function onLoginCallback(outlet){

}

function socketIOHandler(socket) {
    cprint("Socket IO new socket");
    socket.getClientIp = function(){
        return socket._socket.remoteAddress;
        return socket.upgradeReq.connection.remoteAddress;
    }

    var outlet = go.newOutlet(socket, sendFunction, closeFunction, false, onLoginCallback);

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

function watchSocket(socket, outlet) {
    socket.on('message', function (data) {
        data = JSON.parse(data);
        dprint("Received: " + M(data));
        outlet.executeFromSocket(data);
    });
}

function sendFunction(socket, data) {
    dprint("Sending: " + M(data));
    socket.send(J(data));
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


//return false for failing
adapterSecurtyStartSwarmCheck = function (swarm){
    //console.log("Checking " + swarm.meta.swarmingName + ":" + swarm.meta.currentPhase + " in " + swarm.meta.sessionId);
    return true;
}




