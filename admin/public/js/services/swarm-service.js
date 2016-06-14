angular.module('app')
    .service("swarmService", function () {

        var swarmConnection = null;

        return {
            getConnection: function () {
                return swarmConnection;
            },
            initConnection: function (host, port, username, password, tenant, ctor, securityErrorFunction, errorFunction) {
                if(!swarmConnection){
                    swarmConnection = new SwarmClient(host, port, username, password, tenant, ctor, securityErrorFunction, errorFunction);
                    swarmHub.resetConnection(swarmConnection);
                }
                else{
                    swarmConnection.tryLogin( username, password, tenant, ctor, false, securityErrorFunction);
                }

            },
            restoreConnection:function(username, sessionId, failCallback, errorCallback){
                swarmConnection = new SwarmClient("localhost", 8080, username, sessionId, "swarmMonitor", "restoreSession",failCallback, failCallback);
                swarmHub.resetConnection(swarmConnection);
            },
            removeConnection:function(){
                swarmConnection.logout();
            }
        }
    });
