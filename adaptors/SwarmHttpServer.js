/**********************************************************************************************
 * Init
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
    io = require('socket.io').listen(app);
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

function socketIOHandler(socket) {
    cprint("Socket IO new socket");

    var outlet = go.newOutlet(socket, sendFunction, closeFunction);

    socket.on('error', outlet.onCommunicationError.bind(outlet));
    socket.on('close', outlet.onCommunicationError.bind(outlet));
    socket.on('disconnect', outlet.onCommunicationError.bind(outlet));

    watchSocket(socket, outlet);

    outlet.onHostReady();
}

function watchSocket(socket, outlet) {
    socket.on('data', function (data) {
        outlet.executeFromSocket(data);
    });
}

function sendFunction(socket, data) {
    socket.emit('data', data);
}

function closeFunction(socket) {
    try {
    } catch (e) {
    }
}





