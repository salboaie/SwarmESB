/**
 * Created by: sinica
 * Date: 6/7/12
 * Time: 11:36 PM
 */
    
var redis = require("redis");
var fs = require('fs');
var nutil = require("util");
var uuid = require('node-uuid');
var newSwarmPhase = require("./SwarmingPhase.js").newSwarmPhase;
var swarmDSL = require("./SwarmDSL.js");

/**
 * Adapter core class
 * @param nodeName
 * @constructor
 */


function AdapterCore(mainGroup, config, swarmComImpl) {
    /* local utility, functions  */

    if(thisAdapter.initilised){
        delayExit("Creating two adapters in the same process is forbidden.Process existing...", ExitERROR.MultipleCores);
    }
    thisAdapter = this;

    this.config = global_swarmSystem_config;

    if(!swarmComImpl){
        swarmComImpl = require("../com/redisComImpl").implemenation;
    }

    this.nativeMiddleware = swarmComImpl;

    /* initialisation */
    this.nodeName   = swarmComImpl.generateNodeName(mainGroup);
    this.mainGroup  = mainGroup;
    this.coreId = this.config.Core.coreId;
    this.systemId = this.config.Core.systemId;
    thisAdapter.initilised = true;

    swarmComImpl.subscribe(this.nodeName, onMessageFromQueue );

    /*
        execute message in the same context
     */
    this.executeMessage = function(swarmingPhase){
        try {
            var cswarm = swarmDSL.getSwarmDescription(swarmingPhase.meta.swarmingName);
            var executionError = false;
            var stage = swarmingPhase.meta.currentStage;
            if(!stage){
                stage = "code";
            }
            var phaseFunction = cswarm[swarmingPhase.meta.currentPhase][stage];
            if (phaseFunction != null) {
                try {
                    //dprint("Executing " + M(swarmingPhase) );
                    phaseFunction.apply(swarmingPhase);
                }
                catch (err) {
                    logger.hardError("Error when running swarm: " + swarmingPhase.meta.swarmingName + "  Phase: " + swarmingPhase.meta.currentPhase, err);
                    executionError = err;
                }
            }
            else {
                logger.error("DROPPING unknown swarming message!" + M(swarmingPhase) + " for stage " + stage );
                executionError = new Error("Unknown swarm phase or stage");
            }
        }
        catch (err) {
            logger.hardError("Error running swarm : " + swarmingPhase.meta.swarmingName + " Phase:" + swarmingPhase.meta.currentPhase, err);
            executionError = err;
        }
        if(executionError){
            swarmingPhase.failExecution(executionError);
        }
    }

    function onMessageFromQueue(initVars) {
        var swarmingPhase = newSwarmPhase(initVars.meta.swarmingName, initVars.meta.currentPhase, initVars);

        if(!swarmingPhase.meta.phaseStack){
            swarmingPhase.meta.phaseStack = [];
        }
        swarmingPhase.meta.phaseStack.push(initVars.meta.currentPhase);

        if (swarmingPhase.meta.debug) {
            cprint("[" + thisAdapter.nodeName + "] executing message: \n" + M(initVars));
        }

        //swarmingPhase.meta.fromNode = thisAdapter.nodeName;

        var cswarm = swarmDSL.getSwarmDescription(swarmingPhase.meta.swarmingName);
        if (swarmingPhase.meta.swarmingName == undefined || cswarm == undefined) {
            logger.hardError("Unknown swarm requested by another node: " + swarmingPhase.meta.swarmingName);
            return;
        }

        swarmComImpl.asyncExecute(swarmingPhase, function(){
            beginExecutionContext(swarmingPhase);
            thisAdapter.executeMessage(swarmingPhase);
            endExecutionContext();
        })
    }

    this.joinGroup = function(groupName){
        swarmComImpl.joinGroup(groupName);
    }

    this.observeGlobal = function(globalId, swarm, phaseName, target){
        swarmComImpl.observeGlobal(globalId,swarm, phaseName, target );
    }

    this.notifyGlobal = function(globalId, __payload){
        swarmComImpl.notifyGlobal(globalId, __payload);
    }

    var fb = require("../com/FileTransferBusHttpImpl.js").initFileBusNode;
    this.initFileBusNode = function(storageName, protocol, server, port, connectionString){
        this.onReady(function(){
            fb(storageName, protocol, server, port, connectionString);
        });
    }

    this.onReady = function(callback){
        swarmComImpl.onReady(callback);
    }

    require("./loadAutoLibs.js"); //load other libraries that should be automatically loaded
}

/**
 * global variable making current Adapter available anywhere
 * @type {AdapterCore}
 */
thisAdapter = null;
/**
 *
 * @param mainGroup
 * @param config: node config(optional)
 * @param communication implementation
 * @param verbose: set global verbosity
 * @return {*}
 */

exports.init = function (mainGroup, config, swarmComImpl, verbose) {
    globalVerbosity = verbose;
    addGlobalErrorHandler();
    thisAdapter = new AdapterCore(mainGroup, config, swarmComImpl );
    return thisAdapter;
}

//exports.onMessageFromQueueCallBack = onMessageFromQueue;


/**
 * Global function, start a swarm in another adapter, even another session
 * @param targetAdapter
 * @param targetSession
 * @param swarmingName
 * @param ctorName
 */
startRemoteSwarm = function (targetAdapter, targetSession, swarmingName, ctorName, outletId) {
    var args = []; // empty array
    // copy all other arguments we want to "pass through"
    for (var i = 5; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    cprint("Starting remote swarm " + swarmingName + " towards " + targetAdapter + " Args: " + J(args));
    startSwarm("startRemoteSwarm.js", "start", targetAdapter, targetSession, swarmingName, ctorName, outletId, args);
}


var pendingSwarms = [];
function savePendingSwarm(stdarg){
    var args = [];
    for(var i= 0,len= stdarg.length; i<len;i++){
        args.push(stdarg[i]);
    }
    pendingSwarms.push(args);
}


require("semantic-firewall").container.service("guaranteed_startSwarm", ['swarmingIsWorking'], function(outOfService, swarming){
    if(!outOfService){
        var savedPending = pendingSwarms;
        pendingSwarms = null;
        savedPending.forEach(function(args){
            startSwarm.apply(this, args);
        });
    } else {
        if(!pendingSwarms){
            pendingSwarms = [];
        }
    }
})


/**
 * Global function, start swarms knowing swarm name, constructor name and variable arguments
 * @param swarmingName
 * @param ctorName
 * @param var args
 */
startSwarm = function (swarmingName, ctorName) {
    if(pendingSwarms){
        savePendingSwarm(arguments);
        return;
    }

    var throttler = require("./NewSwarmThrottler.js");
    var args = []; // empty array
    // copy all other arguments we want to "pass through"
    for (var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    if(throttler.accept(function(){
            try {
                var swarming = newSwarmPhase(swarmingName, ctorName);
                if (!swarmDSL.swarmExist(swarmingName)) {
                    logger.hardError("Unknown swarm  " + swarmingName);
                    return;
                }
                dprint("Starting swarm " + swarmingName);
                swarming.meta.processIdentity   = thisAdapter.nativeMiddleware.createProcessIdentity();
                swarming.meta.phaseIdentity     = thisAdapter.nativeMiddleware.createPhaseIdentity(swarming);
                swarming.meta.command           = "phase";
                swarming.meta.tenantId          = getCurrentTenant(true);
                swarming.meta.userId            = getCurrentUser(true);
                swarming.meta.sessionId         = getCurrentSession(true);
                swarming.meta.outletId          = getCurrentOutletId(true);
                swarming.meta.entryAdapter      = getEntryAdapter(true);

               beginExecutionContext(swarming, null);
                var start = swarmDSL.getSwarmDescription(swarmingName)[ctorName];

                if (start == undefined) {
                    logger.hardError("Unknown ctor  " + ctorName + " in swarm " + swarmingName);
                    return;
                }


                start.apply(swarming, args);
            }
            catch (err) {
                logger.hardError("Error starting new swarm " + swarmingName + " ctor:" + ctorName, err);
            }
            endExecutionContext();
        }));
}



continueSwarm = function(swarmSerialisation, phaseName,target){
    beginExecutionContext(swarmSerialisation);
        var swarming = newSwarmPhase(swarmSerialisation.meta.swarmingName, "swarm restart", swarmSerialisation);
        dprint("Continuing:", M(swarmSerialisation));
        swarming.swarm(phaseName,target);
    endExecutionContext();
}


