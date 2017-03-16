
var registeredServers = {};

exports.initFileBusNode = function(storageName, protocol, server, port, connectionString){
    startSwarm("FileBus.js", "register",storageName, protocol, server, port, connectionString);

    thisAdapter.fileBus = {
        myInfo : {
            "storageName":storageName,
            "protocol":protocol,
            "server":server,
            "port":port,
            "connectionString":connectionString,
            "adapterName": thisAdapter.nodeName
        },
        acknowledgeNewSwarmFileTransferNode : function(storageName, protocol, server, port, connectionString, adapterName){
            registeredServers[storageName] = {
                "protocol":protocol,
                "server":server,
                "port":port,
                "connectionString":connectionString,
                "adapterName":adapterName
            }
        },
        waitRemoteTransfer:function(transferId, swarm, phase, target){
            startSwarm("FileBus.js", "waitTransfer",transferId, swarm, phase, target);
        },
        getStorageUrl:function(otherStorageName){

            var srv = registeredServers[otherStorageName];
            if(!srv){
                logger.logError("Failed to get an valid url for storage " + storageName);
                throw new Error();
            } else {
                return srv.protocol + "://"+srv.server+":"+srv.port;
            }
        }
    }
    return thisAdapter.fileBus;
}

