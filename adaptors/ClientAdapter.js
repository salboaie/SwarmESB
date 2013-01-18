/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Opens swarmESB to socket connections for tests, node.js clients, flex sockets
 */

var sutil = require('swarmutil');
var go = require('../core/GenericOutlet.js');

//it will take an UUID as node name
thisAdapter = sutil.createAdapter();
thisAdapter.loginSwarmingName   = "login.js";
thisAdapter.join("@TCP-ClientAdapaters");

//globalVerbosity = true;

var myCfg = getMyConfig("ClientAdapter");
var serverPort      = 3000;
var serverHost      = "localhost";

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
new ClientTcpServer(serverPort,serverHost);

function sendFunction(socket, obj){
    sutil.writeObject(socket, obj);
}

function closeFunction(socket){
    socket.destroy();
}

function watchSocket(socket, outlet){
    var parser = sutil.createFastParser(outlet.executeFromSocket);
    socket.on('data', function (data){
        var utfData = data.toString('utf8');
        if(checkPolicy (utfData)){
            return;
        }
        parser.parseNewData(utfData);
    });
}

function ClientTcpServer(port,host){
    console.log("ClientAdapter is starting a TCP server on port " + port);
    var net   	= require('net');
    this.server = net.createServer(
        function (socket){
            var outlet = go.newOutlet(socket, sendFunction, closeFunction);
            socket.on('error',outlet.onCommunicationError.bind(outlet));
            socket.on('close',outlet.onCommunicationError.bind(outlet));
            watchSocket(socket, outlet);
            outlet.onHostReady(); //TODO: fix, we assume that all connections are coming after Redis is ready
        }
    );
    this.server.listen(port,host);
}

/**
 * Check if the data looks like a policy file, flash request. Write the answer
 * @param utfData
 * @return {Boolean}
 */
function checkPolicy(utfData){
    if(utfData.indexOf("<policy-file-request/>") != -1){
        writePolicy(this.socket);
        return true;
    }
    return false;
}


/*
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
} */

var net = require("net");
var policySocket = net.createServer(
    function(socket){
        writePolicy(socket);
    }
);

policySocket.once('error', function (error) {
    logErr('PolicySocket[843] error\n');
    logErr(error);
});

policySocket.listen(843);


makeCall = function(authorisationToken,successCallBack,failedCallBack) {

    var http = require('http');
    var config = getMyConfig("Core");
    var authServiceURL = config['authPath'] ? config['authPath'] : '';
        authServiceURL = authServiceURL.replace('[token]', authorisationToken);

    var params = {
        host: config['authHost'],
        port: config['authPort'],
        path: authServiceURL,
        method: 'GET'
    };

    var request = http.request(params, function(response){
        var buffers = [];

        response.addListener('data', function (chunk) {
            buffers.push(chunk);
        });

        response.addListener('end', function () {
            var responseData = Buffer.concat(buffers);
            try {
                var authResponse = JSON.parse( responseData.toString() );

                if (authResponse.hasOwnProperty('error')) {
                    failedCallBack(responseData);
                } else {
                    successCallBack(authResponse);
                    /*this.isOk = true;

                    this.authorization = authResponse;
                    this.forceSessionId = authResponse['token'];

                    this.swarm("renameSession");*/
                }
            } catch (err) {
               failedCallBack(responseData);
            }
        }.bind(this));

        response.addListener('error', function(error){
            failedCallBack(responseData);
        }.bind(this));
    });

    request.addListener('error', function(error){
        failedCallBack(responseData);
    }.bind(this));

    request.end();
}
