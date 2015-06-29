/**
*
*  A generic outlet (outlet) is a data structure that keeps track for connection between clients and swarmESB (connections
*  can be sockets, web sockets, web services,..?)
*       Any swarm is started from an entry Adapter
*       In the meta part of a swarm message there will be a field: "entryAdapter" having as value the nodeName of the adapter
*  that started current swarm
*       Honey (home) primitives will send the swarm to the entryAdapter channel and the entry Adapter will take care to send
*       the message to the proper outlet
*       A metaField "honeyRequest" will instruct the adapter to search for an outlet and to not execute a swarm phase
*/

var redis = require("redis");
var uuid = require('node-uuid');
var dslUtil = require("../lib/SwarmDSL.js");
var newSwarmPhase = require("./SwarmingPhase.js").newSwarmPhase;

exports.newOutlet = function (communicationObject, sendFunction, closeFunction, isAuthenticated, onLoginCallback) {
    var outlet = new GenericOutlet(communicationObject, sendFunction, closeFunction, isAuthenticated,onLoginCallback);
    return outlet;
}

function GenericOutlet(communicationObject, sendFunction, closeFunction, isAuthenticated, onLoginCallback) {
    var sock = communicationObject;
    var send = sendFunction;
    var close = closeFunction;

    var pendingCmds = new Array();
    var sessionId = uuid.v4();
    var outletId = "GO" + uuid.v4();

    var secretToken = uuid.v4(); //TODO check better algorithm

    var isClosed = false;
    var userId = null;
    var isGuest = true;

    var tenantId = null;

    var currentExecute = null;
    var execute = function (messageObj) {
        if (pendingCmds != null) {
            dprint("Pending... " + J(messageObj));
            pendingCmds.push(messageObj);
        }
        else {
            dprint("Executing message from socket: " + J(messageObj));
            currentExecute(messageObj);
        }
    }
    this.executeFromSocket = execute;

    var sendPendingCmds = function () {
        for (var i = 0; i < pendingCmds.length; i++) {
            currentExecute(pendingCmds[i]);
        }
        pendingCmds = null;
    }

    var executeButNotAuthenticated = function (messageObj) {
        if (messageObj.meta.swarmingName != thisAdapter.loginSwarmingName) {
            logger.logError("Ignoring " + messageObj.meta.swarmingName + " swarm (not being logged in)");
        }
        else {
            executeSafe(messageObj);
        }
    }

    var executeSafe = function (messageObj) {
        if (messageObj.meta.swarmingName == undefined || !dslUtil.repository.swarmExist(messageObj.meta.swarmingName)) {
            logger.warning("Unknown swarm" + messageObj.meta.swarmingName + " required by a client: [" + J(messageObj) + "]");
            return;
        }

        try {
            if (messageObj.meta.command == "getIdentity") {
                if (!isAuthenticated) {
                    var identifyCmd = {
                        meta: {
                            sessionId: sessionId,
                            swarmingName: "login.js",
                            apiVersion: "2.0",
                            command: "identity"
                        }
                    };

                    send(sock, identifyCmd);
                }

                return;
            }
            else if (messageObj.meta.command == "start") {
                try{
                    beginExecutionContext(messageObj);
                    var ctorName = "start";
                    if (messageObj.meta.ctor != undefined) {
                        ctorName = messageObj.meta.ctor;
                    }

                    var throttler = require("./NewSwarmThrottler.js");
                    if(throttler.accept(function(){

                            dprint("Outlet: Starting swarm " + messageObj.meta.swarmingName + " in outlet: " + outletId);
                            var swarming = newSwarmPhase(messageObj.meta.swarmingName, ctorName, messageObj);

                            swarming.meta.command = "phase";
                            swarming.meta.entryAdapter  = thisAdapter.nodeName;
                            swarming.meta.outletId      = outletId;
                            swarming.meta.sessionId     = sessionId;
                            swarming.meta.userId        = userId;

                            if(isGuest){
                                swarming.meta.userRoles   = ['guest'];
                            }
                            else {
                                swarming.meta.userRoles   = ['user'];
                            }

                            var start = dslUtil.getSwarmDescription(messageObj.meta.swarmingName)[ctorName];
                            var args = messageObj.meta.commandArguments;
                            delete swarming.meta.commandArguments;

                            if (start != undefined) {
                                /*if(adapterSecurtyStartSwarmCheck != undefined && !adapterSecurtyStartSwarmCheck(swarming)){
                                 logInfo("Security violation in swarming message!" + M(swarming));
                                 throw "Security check violation";
                                 }*/
                                start.apply(swarming, args);
                            }
                            else {
                                logger.logError("Unknown constructor [" + ctorName + "] for swarm: " + messageObj.meta.swarmingName);
                            }

                        }));
                }catch(err){
                    logger.logError("Failing to start swarm: " + messageObj.meta.swarmingName + " ctor: " + ctorName, err);
                }
                endExecutionContext();
            }
            else if (messageObj.meta.command == "phase") {
                //TODO: fix it, looks wrong.. never used yet, isn't it?
                console.log("Wrong case, not available in 2.0. Planned for 2.1");
                /*var swarming = newSwarmPhase(messageObj.meta.swarmingName, messageObj);
                swarming.swarm(swarming.currentPhase);*/
            }
            else {
                logger.logError("[" + thisAdapter.nodeName + "] I don't know what to execute " + JSON.stringify(messageObj));
            }
        }
        catch(err) {
            logger.logError("Failing to start swarm: " + messageObj.meta.swarmingName + " ctor: " + ctorName, err);
        }
    }


    /**
     * Called when it is ready to communicate by pub/sub channels
     */
    this.onHostReady = function () {
        sendPendingCmds();
    }

    /**
     *  something wrong happened to current connection
     */
    this.onCommunicationError = function (cause) {
        sessionsRegistry.disableOutlet(outletId);
        if(!isClosed){
            isClosed = true;
            console.log("Communication error, closing outlet: " + outletId + " because " + cause);
        }
    }

    this.destroy = function(){
        sessionsRegistry.disableOutlet(outletId);
        isClosed = true;
        closeFunction(sock);
    };
    /**
     * honey in current session got called in an adapter and we got it to send
     */
    this.onHoney = function (swarm) {
        send(sock, swarm);
    }

    /**
     *
     * @return tenantId
     */
    this.getTenantId = function () {
        return tenantId;
    }

    /**
     *
     * @return tenantId
     */
    this.getUserId = function () {
        return userId;
    }

    this.renameSession = function (newSession) {
        sessionId = newSession;
    }

    this.successfulLogin = function (swarmingVariables) {
        this.loginSwarmingVariables = swarmingVariables;
        userId = swarmingVariables.userId;
        isGuest = swarmingVariables.isGuest;
        currentExecute = executeSafe;
        tenantId = swarmingVariables.getTenantId();
        sessionsRegistry.registerOutlet(this);

        if(onLoginCallback){
            onLoginCallback(swarmingVariables, this);
        }
    }

    this.getOutletId = function () {
        return outletId;
    }

    this.getSessionId = function () {
        return sessionId;
    }

    // should remain at the end of constructor
    if (!isAuthenticated) {
        /*
         var identifyCmd = {
         meta                 : {
         sessionId        : sessionId,
         swarmingName     : "login.js",
         command          : "identity"
         }
         };

         send(sock, identifyCmd);
         */
        currentExecute = executeButNotAuthenticated;
    } else {
        currentExecute = executeSafe;
    }


    this.getClientIp = function(){
        return sock.getClientIp();
    }

    //at the end
    sessionsRegistry.addTemporarily(this);
}
