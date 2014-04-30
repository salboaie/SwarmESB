/**********************************************************************************************
 * Adaper providing acces to WebSockets
 **********************************************************************************************/
var sutil = require('swarmutil');
var util = require('util');
var fs = require('fs');
thisAdapter = sutil.createAdapter("SwarmHttpServer", null, null, false);
thisAdapter.loginSwarmingName = "login.js";
/**********************************************************************************************
 * Variables
 **********************************************************************************************/
var go = require('../core/GenericOutlet.js');
var staticServer = require('node-static');

globalVerbosity = false;

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
    initStaticServer();
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

function initStaticServer() {
    file = new (staticServer.Server)(baseFolder);
    app = require('http').createServer(staticServerHandler);
    app.listen(serverPort, serverHost);
}

function initSocketIO() {
    io = require('socket.io').listen(app, { log: false });
    io.sockets.on('connection', socketIOHandler);
}

function staticServerHandler(request, response) {
    cprint("Requesting " + request.url);
    cprint("Serving file...");
    file.serve(request, response, function (error) {
        fileRequestHandler(request, response, error);
    });
}

function fileRequestHandler(request, response, error) {
    if (error) {
        console.error('Error serving %s - %s', request.url, error.message);
        response.writeHead(error.status, error.headers);
        response.end();
    }
    cprint("Serving " + request.url);
}

function listDirectory(path) {
    var realPath = baseFolder + path;
    var stat;
    var list;
    var file;
    var i, len;
    var result = "<ul>";
    try {
        stat = fs.statSync(realPath);
    }
    catch (e) {
        return null;
    }
    if (stat && stat.isDirectory()) {
        list = fs.readdirSync(realPath);
        for (i = 0; len = list.length, i < len; i++) {
            file = list[i];
            realPath = baseFolder + path + '/' + file;
            stat = fs.statSync(realPath);
            if (stat.isDirectory()) {
                result += "<li><b><a href='" + (path + "/" + file) + "'>" + file + "</a></b></li>"
            }
        }
        for (i = 0; len = list.length, i < len; i++) {
            file = list[i];
            realPath = baseFolder + path + '/' + file;
            stat = fs.statSync(realPath);
            if (!stat.isDirectory()) {
                result += "<li><a href='" + (path + "/" + file) + "'>" + file + "</a></li>"
            }
        }
    }
    result += "</ul>";
    return result;
}

function onLoginCallback(outlet){

}

function socketIOHandler(socket) {
    cprint("Socket IO new socket");

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
    socket.on('data', function (data) {
        dprint("Received: " + M(data));
        outlet.executeFromSocket(data);
    });
}

function sendFunction(socket, data) {
    dprint("Sending: " + M(data));
    socket.emit('data', data);
}

function closeFunction(socket) {
    try{
        console.log("Closing socket");
        socket.emit('disconnect');
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




