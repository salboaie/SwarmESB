/*
 A prototype implementation for "Swarm File Transfer Bus"
 The File Transfer Bus offers an API for large binary content transfers between adapters.
 Transfers signaling is performed from swarms

 Implementation can be:
    - A http server that can be accessed from other nodes
    - A P2P node

 The core provides the following function:
        registerSwarmFileTransferBus(storageName, protocol, connectionString);
 Use:
 in your

 */

var fileBus = require("../../lib/FileBusUtil.js");
var fs = require("fs");

var http = require('http');
var querystring = require('querystring');
var request = require('request');

var cfgFileSizeLimit = getConfigProperty("fileSizeLimit", 100*1024*1024);//100 mega

function processDownload(request, response, temporaryFilePath, callback) {
        var requestId = 0; // getRequestid(request)
        request.on('data', function(data) {
            fs.appendFile.async(temporaryFilePath,data);
            /*if(queryData.length > cfg.limit) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }*/
        });

        request.on('end', function() {
            //request.post = querystring.parse(queryData);
            callback();
        });
}

var requestCallbacks = {};

exports.initFileBusNode = function(storageName, cfgBindAddress, cfgPort, tempFolder){
    if(!cfgPort)        {
        cfgPort      = getConfigProperty("port", 3001);
    }

    if(!cfgBindAddress) {
        cfgBindAddress = getConfigProperty("fbBindAddress", "localhost");
    }

    var http = require("http");
    http.createServer(function(request, response) {
        //console.log("Request:", request);
        if(request.method == 'PUT') {
            var requestUUID = request.url.substring(1); // remove the /
            dprint("Downloading content for: ", requestUUID);
            var temporaryFilePath = tempFolder + "/"+ requestUUID;
            if(!tempFolder){
                temporaryFilePath = swarmTempFile.async();
            }

            (function(temporaryFilePath){
                processDownload(request, response, temporaryFilePath, function() {
                    console.log("Finishing transfer: ", requestUUID, " in ", temporaryFilePath);
                    thisAdapter.notifyGlobal(requestUUID, temporaryFilePath);
                    response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                    response.end();
                });
            }).wait(temporaryFilePath);
        } else {
            response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
            response.end();
        }
    }).listen(cfgPort, cfgBindAddress);

    var fileBusInstance = fileBus.initFileBusNode(storageName, "http",cfgBindAddress, cfgPort, "");
    fileBusInstance.transferFile = function(localFilePath, otherStorageName, swarm, phase, targetNode){

        var requestUUID = generateUUID();

        thisAdapter.observeGlobal(requestUUID, swarm, phase, targetNode);
        var url = fileBusInstance.getStorageUrl(otherStorageName)+"/"+requestUUID;
        console.log("Starting transfer of file : ",localFilePath,  " to ", url);
        fs.createReadStream(localFilePath).pipe(request.put(url));
        return requestUUID;
    }

    fileBusInstance.onTransferReady = function(requestUUID, callback){
        requestCallbacks[requestUUID] = callback;
    }

    return fileBusInstance;
}