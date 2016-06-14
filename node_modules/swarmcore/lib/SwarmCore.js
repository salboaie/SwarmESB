var clone = require('clone');
var assert = require("assert");


/* it will use createSwarmCallback for swait */
var async = require('asynchron');

exports.adapter      = require("./Adapter.js");
exports.createClient = require("../nodeClient/NodeClient.js").createClient;

exports.runStandardAdapter = function (name){
    require("../etc/adapters/" + name + ".js");
}

//exports.newSet = require("./Set.js").newSet;

exports.createAdapter = exports.adapter.init;
var fs = require("fs");
var uuid = require('node-uuid');
require('./errorCodes.js');



/**
 * Get a path that is absolute or possible a relative path to SWARM_PATH)
 * @param possibleRelativePath
 * @return {*}
 */

getSwarmFilePath = function (possibleRelativePath) {
    var basePath = process.env.SWARM_PATH;
    if (possibleRelativePath[0] == "/" || possibleRelativePath[1] == ":") {
        return possibleRelativePath;
    }
    return basePath + "/" + possibleRelativePath;
}

var getSwarmESBCorePath = require("../index.js").getCorePath;

/**
 *
 * Set of function helping swarm enabled functions to know in what context they are (current swarm, current session, tenant,etc)
 *
 * */

function SwarmExecutionContext(swarm){
    var identity = generateUUID();
    this.currentSwarm = swarm;
    this.processIdentity = swarm.meta.processIdentity;
    this.phaseIdentity = swarm.meta.phaseIdentity;
    this.sessionId = swarm.meta.sessionId;
    this.outletId = swarm.meta.outletId;
    this.swarmingName = swarm.meta.swarmingName;
    this.tenantId = swarm.meta.tenantId;
    this.userId = swarm.meta.userId;
    //console.log("new execution for userId", swarm.meta.userId, swarm.meta.swarmingName,swarm.meta.currentPhase);
    //ctxt.responseURI        = swarm.meta.responseURI;
    /**
     * adapter that invoked current swarm
     */
    this.entryAdapter = swarm.meta.entryAdapter;
    var counter = 0;

    //assert.notEqual(swarm.meta.phaseIdentity, undefined, "Phase identity should be defined!");

    var debugFuckingCounter = false;

    this.use = function(debugString){
        counter++;
        if(debugString || debugFuckingCounter){
            console.log(debugString, "Counter+ ", counter, " Phase:", swarm.meta.phaseIdentity, "Context: ", identity, swarm.meta.swarmingName);
        }

    }

    var pendingSwarms = [];
    var attachedGC    = [];

    this.release = function(debugString){
            counter--;
        if(debugString || debugFuckingCounter){
            console.log(debugString, "Counter- ", counter, " Phase:", swarm.meta.phaseIdentity, "Context: ", identity, swarm.meta.swarmingName);
        }

            if(counter == 0) {
                thisAdapter.nativeMiddleware.sendPendingSwarms(this.currentSwarm, pendingSwarms);
                thisAdapter.nativeMiddleware.saveSharedContexts(attachedGC);
                delete SwarmExecutionContext.prototype.executionContexList[this.phaseIdentity];
        }
    }

    this.pushPendingSwarm = function(swarm){
        pendingSwarms.push(swarm);
    }

    this.attachSharedContext = function(context){
        attachedGC.push(context);
    }

}

newPendingSwarm = function(swarm){
    if(executionContext){
        executionContext.pushPendingSwarm(swarm);
    } else {
        throw new Error("Executing invalid code from callbacks. Please use asynchron/swait to keep proper track for execution contexts");
    }
}

SwarmExecutionContext.prototype.executionContexList = {};
SwarmExecutionContext.prototype.findContext = function(swarm) {
    var ctxt = SwarmExecutionContext.prototype.executionContexList[swarm.meta.phaseIdentity];
    if(!ctxt){
        ctxt = new SwarmExecutionContext(swarm);
    }
    return ctxt;
};


var executionStack = [];
var executionContext = null;

system_working_with_swarmCore_library_do_not_touch_please = true;

beginExecutionContext = function (swarm, ctxt , debugString) {
    if(!ctxt){
        ctxt = SwarmExecutionContext.prototype.findContext(swarm);
        ctxt.use(debugString);
    }
    executionStack.push(ctxt);
    executionContext = ctxt;
}

endExecutionContext = function (debugString) {
    executionStack.pop();
    executionContext.release(debugString);

    var l = executionStack.length;
    if(l>0){
        executionContext = executionStack[l-1];
    } else{
        executionContext = null;
    }

}

/**
 * Create a callback that knows in what context will get executed (tenant,session,etc)
 * @param callBack
 * @return {Function}
 */
createSwarmCallback = function (callBack, debugString) {
    var ctxt = executionContext;
    if(!executionContext){
        logger.info("Use createSwarmCallback only in phase code context.  Use of createSwarmCallback or .swait in upper callbacks");
        throw new Error("Invalid context! Call this function in a swarm phase only!");
    }
    executionContext.use();
    return function () {
        beginExecutionContext(null, ctxt, debugString);
        var args = []; // empty array
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        try{
            callBack.apply(this, args);
        } catch(err){
            logger.error("Unexpected error when calling swarmified callback in swarm execution context: " + ctxt.currentSwarm.meta.swarmingName + " in phase " + ctxt.currentSwarm.meta.currentPhase, err);
        }
        endExecutionContext(debugString);
    }
}


/*
    S is shortcut for createSwarmCallback
 */
S = createSwarmCallback;

async.createSwait();

getCurrentSession = function (silent) {
    if(executionContext == null || !executionContext.sessionId){
        if(!silent){
            logger.warn("Security warning: code executing outside of a swarm context");
        }
        return "NO_SESSION";
    }
    return executionContext.sessionId;
}

getCurrentSwarmProcess = function (silent) {
    if(executionContext == null || !executionContext.processIdentity){
        if(!silent){
            logger.warn("Security warning: code executing outside of a swarm context");
        }
        return "NO_PROCESS";
    }
    return executionContext.processIdentity;
}

getCurrentSwarmPhase = function (silent) {
    if(executionContext == null || !executionContext.phaseIdentity){
        if(!silent){
            logger.warn("Security warning: code executing outside of a swarm context");
        }
        return "NO_PROCESS";
    }
    return executionContext.phaseIdentity;
}

getCurrentOutletId = function (silent) {
    if(executionContext == null || !executionContext.outletId){
        if(!silent){
            logger.warn("Security warning: code executing outside of a swarm context");
        }
        return "NO_OUTLET";
    }
    return executionContext.outletId;
}

getCurrentTenant = function (silent) {
    if(executionContext == null || !executionContext.tenantId){
        if(!silent){
            logger.warn("Security warning: code executing outside of a swarm context");
        }
        return "NO_TENANT";
    }
    return executionContext.tenantId;
}

getCurrentUser = function (silent) {
    if(executionContext == null || !executionContext.userId){
        if(!silent){
            logger.warn("Security warning: code executing outside of a swarm context");
        }
        return "NO_USER";
    }
    return executionContext.userId;
}

getCurrentSwarm = function () {
    if(!executionContext){
        return "SystemExecution";
    }
    return executionContext.swarmingName;
}

/*
 getCurrentResponseURI = function(){
 return executionContext.responseURI;
 } */

getEntryAdapter = function () {
    if(!executionContext){
        return "SystemExecution";
    }
    return executionContext.entryAdapter;
}
/**
 *  Functions for creating tenant aware contexts in adapters
 * @constructor
 */

function VariablesContext() {

}

VariablesContext.prototype.getArray = function (name) {
    if (this[name] == undefined) {
        this[name] = [];
    }
    return this[name];
}

VariablesContext.prototype.getObject = function (name) {
    if (this[name] == undefined) {
        this[name] = {};
    }
    return this[name];
}

/*

tenantsContexts = {};

getSharedContext = function (contextId, callback) {
    var ctxt = thisAdapter.nativeMiddleware.getSharedContext.async(contextId);
    if(!executionContext){
      errLog("Use getSharedContext only in phase code context.  Use of createSwarmCallback or .swait could be appropriate");
    }
    console.log("Waiting...");
    (function(ctxt){
        console.log("Attaching...");
        executionContext.attachSharedContext(ctxt);
        callback(null, ctxt);
    }).swait(ctxt);

}

getDisconectedSharedContext = function (contextId, callback) {
    var ctxt = thisAdapter.nativeMiddleware.getSharedContext.async(contextId);
    (function(ctxt){
        callback(null, ctxt);
    }).wait(ctxt);
}

getLocalContext = function (contextId) {
    if (contextId == undefined) {
        contextId = "thisAdapter";
    }

    if (executionContext.tenantId != null) {
        var tenantContext = tenantsContexts[executionContext.tenantId];
        if (tenantContext == undefined) {
            tenantContext = tenantsContexts[executionContext.tenantId] = new VariablesContext();
        }
        var retCtxt = tenantContext[contextId];
        if (retCtxt == undefined) {
            dprint("Creating new local context ", contextId," in tenant: ", executionContext.tenantId);
            retCtxt = tenantContext[contextId] = new VariablesContext();
        }
        return retCtxt;
    }
    cprint("Error: getContext called without an execution tenant active");
    return null;
}

removeLocalContext = function (contextId) {
    console.log("Removing context ", contextId);
    if (executionContext.tenantId != null) {
        var tenantContext = tenantsContexts[executionContext.tenantId];
        delete tenantContext[contextId];
    }
}

*/

/**
 * catching all errors is nice and mandatory in a server, all errors got logged
 */
//TODO: better handling, may be a restart? notifications on a central monitor
addGlobalErrorHandler = function () {
    process.on('uncaughtException', function (err) {
        console.log('Process : '+thisAdapter.nodeName+' generated an error\n');
        console.log(err, err.stack);

        logger.error("Uncaught exception in global handler", err);
        uncaughtExceptionString = "<br>Error : " + err.toString() + "<br>Stack :" + err.stack;
        uncaughtExceptionExists = true;
    });
}


/**
 *  global settings, used in SwarmClient and adapters that are doing authentication!
 * @type {Object}
 */
swarmSettings = {authentificationMethod: "default"};

function readConfig(){
    var basePath = process.env.SWARM_PATH;
    var configName = process.env.SWARM_NODE_TYPE;
    if(!configName){
        configName = "config";
    }
    var basicConfigFile = basePath + "/etc/" + configName;
    try {
        var configContent = fs.readFileSync(basicConfigFile);
        return JSON.parse(configContent);
    }
    catch (err) {
        delayExit("Syntax error on parsing config file: " + basicConfigFile + " |: " + err.toString(), ExitCodes.WrongConfig);
        return {};
    }
}

global_swarmSystem_config = readConfig();


/**
 *  return the config for current adapter
 */
getMyConfig = function (adapterType) {
    if (adapterType == undefined && thisAdapter) {
        adapterType = thisAdapter.mainGroup;
    }
    var cfg = global_swarmSystem_config[adapterType];
    if (cfg == undefined) {
        cprint("Config section missing for " + adapterType);
        return {};
    }
    return cfg;
}

getConfigProperty = function( propName, defaultValue, configSection){
    if (configSection == undefined) {
        configSection = thisAdapter.mainGroup;
    }
    var cfg = global_swarmSystem_config[configSection];
    if (cfg == undefined) {

        return defaultValue;
    }
    var val =  cfg[propName];
    if(!val){
        return defaultValue;
    }
    return val;
}


/**
 *   generate an UID
 * @return {*}
 */
generateUUID = function () {
    return uuid.v4()
}



process.on("message", function (data) {
    var message = {'ok': true};

    if (uncaughtExceptionExists) {
        message = {'ok': false, 'details': 'Uncaught Exception : ' + uncaughtExceptionString, 'requireRestart': true};
    }
    else {
        var handler = global['adapterStateCheck'];
        if (handler) {
            var handlerResult;
            try {
                handlerResult = handler(data);
            } catch (e) {
                handlerResult = {'ok': false, 'details': "Error calling custom adapterStateCheck handler - " + e.toString()};
            }
            message = handlerResult;
        }
    }

    process.send(message);
});


var basePath = process.env.SWARM_PATH;
if (process.env.SWARM_PATH == undefined) {
    delayExit("Please set SWARM_PATH variable to your installation folder", ExitCodes.WrongSwarmPath);
}

argsBinder = function(callback, arguments){
    return function(){
        var args = [];
        for(var i = 0; i < arguments.length; i++){
            args.push(arguments(i));
        }
        console.log(args);
        callback.apply(null,args);
    }
}

callLaterBinder = function(timeout,callback){
    return function(){
        setTimeout(argsBinder(callback, arguments), timeout);
    }
}


loadThrottlerConfig = function(to, adapterName, typeName){
    if(!typeName){
        typeName = "throttler";
    }

    var myCfg = null;
    if(thisAdapter){
        thisAdapter.config[adapterName];
    }
    if( myCfg){
        var t = myCfg[typeName];
        if(t){
            if(t["limit"]){
                throttlerConfig.limit       = t.limit;
            }
            if(t["timeUnit"]){
                throttlerConfig.timeUnit    = t.timeUnit;
            }
        }
    }
}


swarmTempFile = function(callback){
    var tmp = require('tmp');
    var templateFilePath = process.env.SWARM_PATH + '/tmp/tmp-XXXXXX';
    tmp.file({ template: templateFilePath }, callback);
}

syncLoadJSONResource = function(path){
    var fullPath = process.env.SWARM_PATH + '/'+ path;
    var fileContent = fs.readFileSync(fullPath).toString();
    return JSON.parse(fileContent);
}


mkArgs = function(myArguments, from){
    if(!from){
        from = 0;
    }

    if(myArguments.length <= from){
        return null;
    }
    var args = [];
    for(var i = from; i<myArguments.length;i++){
        args.push(myArguments[i]);
    }
    return args;
}


exports.getSecretFolder = function(){
    var organizationName = "";
    try{
        var code = process.env['HTTPS_AUTOCONFIG_CODE'];
        var str = new Buffer(code, 'base64').toString('ascii');
        var obj = JSON.parse(str);
        organizationName = obj.name;
    } catch(err){
        //...
    }
    var baseFolder = process.env.SWARM_PATH;
    fs.mkdir(baseFolder+ "/keys/", function(){});
    console.log(">>>>>>>>>>>>>>>>", baseFolder+ "/keys/"+organizationName);
    return baseFolder+ "/keys/"+organizationName;
}