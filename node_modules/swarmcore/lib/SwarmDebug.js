
var util = require("util");
var fs = require("fs");
cprint = console.log;

var monitor = require('double-check');


logger      = monitor.logger;
assert      = monitor.assert;
throwing    = monitor.exceptions;


var temporaryLogBuffer = [];


if(!logger.record){
    logger.record = function(record){
        console.log(record.message);
        if(record.stack){
            console.log(record.stack);
        }
        if(temporaryLogBuffer){
            temporaryLogBuffer.push(record);
        } else {
            startSwarm("log.js", "record", record);
        }
    }
}

var container = require("safebox").newContainer;

container("swarmLoggingMonitor", ["swarmingIsWorking", "networkLogger"], function(outOfService,swarming, networkLogger){
    if(outOfService){
        if(!temporaryLogBuffer){
            temporaryLogBuffer = [];
        }
    } else {
        var tmp = temporaryLogBuffer;
        temporaryLogBuffer = null;
        startSwarm("log.js", "recordBuffer", tmp);
    }
})


uncaughtExceptionString = "";
uncaughtExceptionExists = false;
if(typeof globalVerbosity == 'undefined'){
    globalVerbosity = false;
}

var DEBUG_START_TIME = new Date().getTime();

function getDebugDelta(){
    var currentTime = new Date().getTime();
    return currentTime - DEBUG_START_TIME;
}

/**
 * Debug functions, influenced by globalVerbosity global variable
 * @param txt
 */
dprint = function (txt) {
    if (globalVerbosity == true) {
        if (thisAdapter.initilised ) {
            console.log("DEBUG: [" + thisAdapter.nodeName + "](" + getDebugDelta()+ "):"+txt);
        }
        else {
            console.log("DEBUG: (" + getDebugDelta()+ "):"+txt);
            console.log("DEBUG: " + txt);
        }
    }
}

/**
 * obsolete!?
 * @param txt
 */
aprint = function (txt) {
    console.log("DEBUG: [" + thisAdapter.nodeName + "]: " + txt);
}


/**
 * Error handling families of functions
 *
 */

thisAdapter = {
    nodeName : "Starting Node",
    initilised: false
};


/**
 * Shortcut to JSON.stringify
 * @param obj
 */
J = function (obj) {
    return JSON.stringify(obj);
}


/**
 * Utility function usually used in tests, exit current process after a while
 * @param msg
 * @param timeout
 */
delayExit = function (msg, retCode,timeout) {
    if(retCode == undefined){
        retCode = ExitCodes.UnknownError;
    }

    if(timeout == undefined){
        timeout = 100;
    }

    if(msg == undefined){
        msg = "Delaying exit with "+ timeout + "ms";
    }

    console.log(msg);
    setTimeout(function () {
        process.exit(retCode);
    }, timeout);
}


localLog = function (logType, message, err) {
    var time = new Date();
    var now = time.getDate() + "-" + (time.getMonth() + 1) + "," + time.getHours() + ":" + time.getMinutes();
    var msg;

    msg = '[' + now + '][' + thisAdapter.nodeName + '] ' + message;

    if (err != null && err != undefined) {
        msg += '\n     Err: ' + err.toString();
        if (err.stack && err.stack != undefined)
            msg += '\n     Stack: ' + err.stack + '\n';
    }

    cprint(msg);
    if(thisAdapter.initilised){
        try{
            fs.appendFileSync(getSwarmFilePath(thisAdapter.config.logsPath + "/" + logType), msg);
        } catch(err){
            console.log("Failing to write logs in ", thisAdapter.config.logsPath );
        }

    }
}

/**
 * Print swarm contexts (Messages) and easier to read compared with J
 * @param obj
 * @return {string}
 */
M = function (obj) {
    var meta = {};
    var ctrl = {};
    var req = {};

    meta.swarmingName   = obj.meta.swarmingName;
    meta.currentPhase   = obj.meta.currentPhase;
    meta.currentStage   = obj.meta.currentStage;
    meta.targetGroup    = obj.meta.targetGroup;
    meta.targetNodeName = obj.meta.targetNodeName;

    ctrl.entryAdapter       = obj.meta.entryAdapter;
    ctrl.honeyRequest       = obj.meta.honeyRequest;
    ctrl.debug              = obj.meta.debug;
    ctrl.phaseIdentity      = obj.meta.phaseIdentity;
    ctrl.processIdentity    = obj.meta.processIdentity;

    req.userId      = obj.meta.userId;
    req.tenantId    = obj.meta.tenantId;
    req.sessionId   = obj.meta.sessionId;
    req.outletId    = obj.meta.outletId;

    /*if (obj.meta.pleaseConfirm != undefined) {
     ctrl.pleaseConfirm = obj.meta.pleaseConfirm;
     }*/
    if (obj.meta.phaseExecutionId != undefined) {
        ctrl.phaseExecutionId = obj.meta.phaseExecutionId;
    }
    /*if (obj.meta.confirmationNode != undefined) {
     ctrl.confirmationNode = obj.meta.confirmationNode;
     }*/

    var vars = {};
    for (var i in obj) {
        if (i != "meta") {
            vars[i] = obj[i];
        }
    }

    return "\t{\n\t\tMETA: " + J(meta) +
        "\n\t\tCTRL: " + J(ctrl) +
        "\n\t\tREQS: "  + J(req) +
        "\n\t\tVARS: " + J(vars) +
        "\n\t\tDUMP: " + J(obj) + "\n\t}";
}

/**
 * Experimental functions
 */
printf = function () {
    var args = []; // empty array
    // copy all other arguments we want to "pass through"
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    var out = util.format.apply(this, args);
    console.log(out);
}

sprintf = function () {
    var args = []; // empty array
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    return util.format.apply(this, args);
}

