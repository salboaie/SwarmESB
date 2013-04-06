/**
 * Adapter that opens swarmESB to php or other environments that can't do sockets but can do REST
 *
 */
var sutil = require('swarmutil');
var static = require('node-static');
var util = require('util');

thisAdapter = sutil.createAdapter("SwarmHttpServer", null,null,false);
//thisAdapter.loginSwarmingName   = "login.js";
//globalVerbosity = true;

var myCfg = getMyConfig();
var serverPort      = 8080;
var serverHost      =  "localhost";
var baseFolder      = "";

if(myCfg.port != undefined){
    serverPort = myCfg.port;
}

if(myCfg.bindAddress != undefined){
    serverHost = myCfg.bindAddress;
    serverHost = serverHost.trim();
    if (serverHost.length == 0 || serverHost == '*') {
        serverHost = null;
    }
}
if(myCfg.home != undefined && myCfg.home != ""){
    baseFolder = myCfg.home;
} else{
    cprint("\'home\' property should be defined for SwarmHttpServer");
    process.exit();
}

var file = new(static.Server)(baseFolder);

function handler (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        cprint("Serving: " +  request.url);
        file.serve(request, response);
    });
}

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);

app.listen(serverPort,serverHost);

io.sockets.on('connection', function (socket) {
    cprint("Socket IO");
    /*socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log("XXX" + J(data));
    });*/
});