var sutil = require('swarmutil');
var go = require('../core/GenericOutlet.js');

var socketOk = true;
var socketDetails = "";
thisAdapter = sutil.createAdapter("ClientAdapter");

globalVerbosity = false;
thisAdapter.loginSwarmingName = "login.js";
//thisAdapter.join("@TCP-ClientAdapaters");

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
        if (checkPolicy(utfData, socket)) {
            return;
        }
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
                outlet.onCommunicationError(" unknown error ");
            });

            socket.on('close', function (er) {
                outlet.onCommunicationError(" server closing ");
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
        socketOk = false;
        socketDetails = log;
        logErr("Client adapter server error : " + log);
    });

    this.server.on('close', function (er) {
        socketOk = false;
        socketDetails = "Server closed.";
        logErr("Client adapter close .");
    });
}


adapterStateCheck = function (data) {
    return {ok: socketOk, details: socketDetails, requireRestart: !socketOk};
}


/**
 * Check if the data looks like a policy file, flash request. Write the answer
 * @param utfData
 * @return {Boolean}
 */
function checkPolicy(utfData, socket) {
    if (utfData.indexOf("<policy-file-request/>") != -1) {
        writePolicy(socket);
        return true;
    }
    return false;
}


/*
 var net = require("net");
 var policySocket = net.createServer(
 function (socket) {
 writePolicy(socket);
 }
 );

 policySocket.once('error', function (error) {
 logErr('PolicySocket[843] error\n');
 logErr(error);
 });

 policySocket.listen(843);
 */

makeCall = function (authorisationToken, successCallBack, failedCallBack) {

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

    var request = http.request(params, function (response) {
        var buffers = [];

        response.addListener('data', function (chunk) {
            buffers.push(chunk);
        });

        response.addListener('end', function () {
            var responseData = Buffer.concat(buffers);
            try {
                var authResponse = JSON.parse(responseData.toString());

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

        response.addListener('error', function (error) {
            failedCallBack(responseData);
        }.bind(this));
    });

    request.addListener('error', function (error) {
        failedCallBack(responseData);
    }.bind(this));

    request.end();
}


//return false for failing
adapterSecurtyStartSwarmCheck = function (swarm){
    //console.log("Checking " + swarm.meta.swarmingName + ":" + swarm.meta.currentPhase + " in " + swarm.meta.sessionId);
    return true;
}
