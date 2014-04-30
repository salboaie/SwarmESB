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
var util = require('swarmutil');
var uuid = require('node-uuid');


exports.newOutlet = function (communicationObject, sendFunction, closeFunction, isAuthenticated,onLoginCallback) {
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

    var isClosed = false;
    var userId = null;
    var     isGuest = true;

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
        /* CHECK !?
         if(this.onSubscribe){
         this.onSubscribe();
         } */
    }

    var executeButNotAuthenticated = function (messageObj) {
        if (messageObj.meta.swarmingName != thisAdapter.loginSwarmingName) {
            logErr("Could not execute [" + messageObj.meta.swarmingName + "] swarming without being logged in");
            close(sock);
        }
        else {
            executeSafe(messageObj);
        }
    }

    var executeSafe = function (messageObj) {
        if (messageObj.meta.swarmingName == undefined || thisAdapter.compiledSwarmingDescriptions[messageObj.meta.swarmingName] == undefined) {
            logErr("Unknown swarm required by a client: [" + messageObj.meta.swarmingName + "]");
            return;
        }
        beginExecutionContext(messageObj);

        try {
            if (messageObj.meta.command == "getIdentity") {
                if (!isAuthenticated) {
                    var identifyCmd = {
                        meta: {
                            sessionId: sessionId,
                            swarmingName: "login.js",
                            apiVersion: "1.1",
                            command: "identity"
                        }
                    };

                    send(sock, identifyCmd);
                }
                return;
            }
            else if (messageObj.meta.command == "start") {
                var ctorName = "start";
                if (messageObj.meta.ctor != undefined) {
                    ctorName = messageObj.meta.ctor;
                }
                dprint("Outlet: Starting swarm " + messageObj.meta.swarmingName + " in outlet: " + outletId);
                var swarming = util.newSwarmPhase(messageObj.meta.swarmingName, ctorName, messageObj);

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

                var start = thisAdapter.compiledSwarmingDescriptions[messageObj.meta.swarmingName][ctorName];
                var args = messageObj.meta.commandArguments;
                delete swarming.meta.commandArguments;

                //cprint("GO:" + J(args));
                if (start != undefined) {
                    if(adapterSecurtyStartSwarmCheck != undefined && !adapterSecurtyStartSwarmCheck(swarming)){
                        logInfo("Security violation in swarming message!" + M(swarming));
                        throw "Security check violation";
                    }
                    start.apply(swarming, args);
                }
                else {
                    logErr("Unknown constructor [" + ctorName + "] for swarm: " + messageObj.meta.swarmingName);
                }
            }
            else if (messageObj.meta.command == "phase") {
                //TODO: fix it, looks wrong.. never used yet, isn't it?
                var swarming = util.newSwarmPhase(messageObj.meta.swarmingName, messageObj);
                swarming.swarm(swarming.currentPhase);
            }
            else {
                logErr("[" + thisAdapter.nodeName + "] I don't know what to execute " + JSON.stringify(messageObj));
            }
        }
        catch
            (err) {
            logErr("Failing to start swarm: " + messageObj.meta.swarmingName + " ctor: " + ctorName, err);
        }
        endExecutionContext();
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
        console.log("            Closing outlet " + outletId + " beacuse " + cause);
        thisAdapter.deleteOutlet(this);
        if(!isClosed){
            isClosed = true;
            console.log("Outlet error, closing session!?" + sessionId);
            //startSwarm("SessionActivity.js", "close", sessionId, outletId);
        }
    }

    this.destroy = this.onCommunicationError;
    /**
     * honey in current session got called in an adapter and we got it to send
     */
    this.onHoney = function (swarm) {

        //console.log("GO Honey : "+M(swarm));

        send(sock, swarm);
    }

    /**
     *
     * @return tenantId
     */
    this.getTenantId = function () {
        return tenantId;
    }

    this.renameSession = function (newSession) {
        /*var oldSessionId = this.sessionId;
         setTimeout(function(){
         //cleanings after 2 seconds
         thisAdapter.connectedOutlets[oldSessionId] = null;
         }.bind(this),2000); */
        thisAdapter.renameSession(sessionId, newSession);
        sessionId = newSession;
    }

    this.successfulLogin = function (swarmingVariables) {
        this.loginSwarmingVariables = swarmingVariables;
        userId = swarmingVariables.userId;
        isGuest = swarmingVariables.isGuest;
        currentExecute = executeSafe;
        tenantId = swarmingVariables.getTenantId();
        startSwarm("SessionActivity.js", "start", sessionId, tenantId, userId);
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

    thisAdapter.addOutlet(this);

    this.getClientIp = function(){
        return sock.getClientIp();
    }
}
