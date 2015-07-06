/**
 * Created by salbo_000 on 04/11/2014.
 */
//All proper adapters using SwarmCore should provide a set of functions in the globalObject: swarmComImpl

var redis   = require("redis");
var dslUtil = require("../lib/SwarmDSL.js");
var fs = require("fs");
var getSwarmESBCorePath = require("../index.js").getCorePath;


var container = require("semantic-firewall").container;


/* encapsulate as many details about communication, error recovery and distributed transactions
*  different communication middleware and different tradeoffs on error recovery and transactions could be implemented
* */
function RedisComImpl(){
    var self = this;
    var redisHost = thisAdapter.config.Core.redisHost;
    var redisPort = thisAdapter.config.Core.redisPort;
    var RateLimiter = require('limiter2').RateLimiter;

    this.swarmACL = null;

    var throttlerConfig = {
        limit:10000,
        timeUnit:"minutes"
    };

    loadThrottlerConfig(throttlerConfig, "Core");
    loadThrottlerConfig(throttlerConfig, thisAdapter.mainGroup);

    var MAX_REBORNCOUNTER = 100;

    var pubsubRedisClient = redis.createClient(redisPort, redisHost);
    var redisClient  = null;

    pubsubRedisClient.retry_delay = 1000;
    pubsubRedisClient.max_attempts = 100;
    pubsubRedisClient.on("error", onRedisError);
    pubsubRedisClient.on("ready", function(){
        redisClient = redis.createClient(redisPort, redisHost);
        self.privateRedisClient = redisClient;
        redisClient.retry_delay = 2000;
        redisClient.max_attempts = 20;
        redisClient.on("error", onRedisError);
        redisClient.on("reconnecting", onRedisReconnecting);
        redisClient.on("ready", onCmdRedisReady);
    });

    var pendingInitialisationCalls = [];

    var limiter = new RateLimiter(throttlerConfig.limit, throttlerConfig.timeUnit);
    this.resetThrottler = function(limit, timeUnit){
        throttlerConfig.limit = limit;
        throttlerConfig.timeUnit = timeUnit;
        limiter = new RateLimiter(limit, timeUnit);
    }

    function onRedisError(error){
        container.outOfService('redisConnection');
        logger.error("Redis error", error);
    }

    bindAllMembers = function(object){
        for(var property in object){
            if(typeof object[property] == 'function'){
                object[property] = object[property].bind(object);
            }
        }
    }

    function onCmdRedisReady(error){
        console.log("Node " + thisAdapter.nodeName + " ready for swarms!");
        bindAllMembers(redisClient);
        if(self.uploadDescriptionsRequired){
            uploadDescriptionsImpl();
            registerInSharedDB();
        } else {
            self.reloadAllSwarms();
        }


        self.redisReady = true;

        self.joinGroup(thisAdapter.mainGroup, true);

        saveHistoricNodeInfo(thisAdapter.nodeName, "startTime",Date.now());
        saveHistoricNodeInfo(thisAdapter.nodeName, "mainGroup",thisAdapter.mainGroup);
        saveHistoricNodeInfo(thisAdapter.nodeName, "systemId",thisAdapter.systemId);
        self.joinGroup("All");
        for(var i = 0, l = pendingInitialisationCalls.length; i<l; i++){
            var call =  pendingInitialisationCalls[i];
            call();
        }
        pendingInitialisationCalls = null;

        container.resolve("redisConnection",redisClient);
    }

    function onRedisReconnecting(event) {
        //cprint("Redis reconnecting attempt [" + event.attempt + "] with delay [" + event.delay + "] !");

        if(pubsubRedisClient.retry_delay < 30000){
            pubsubRedisClient.retry_delay += 1000;
        }
        localLog("redis", "Redis reconnecting attempt [" + event.attempt + "] with delay [" + event.delay + "] !", event);
    }

    pubsubRedisClient.on("reconnecting", onRedisReconnecting);

    /* generate swarm message identity*/
    this.createPhaseIdentity = function(swarm){
        /* create with uuid v4*/
        return swarm.meta.processIdentity + "/Phase:" + swarm.meta.currentPhase + "/" + generateUUID();
    }

    /* generate swarm message identity*/
    this.createProcessIdentity = function(){
        /* create with uuid v4*/
        return "Process:" + generateUUID();
    }

    /* generate unique names */
    this.generateNodeName = function(mainGroup){
        return "_"+mainGroup + "("+generateUUID()+")";
    }

    /* pendingSwarm is an array containing swarms generated in current swarm and required to be sent asap */
    /* this function get called when the execution of a phase is done (including all the asynchronous calls)*/
    this.sendPendingSwarms = function(currentSwarm, pendingSwarms){

        function emptyPending(){
            while(pendingSwarms.length > 0) {
                pendingSwarms.pop();
            }
        }
        function doRunPending(){
            while(pendingSwarms.length > 0 ){
                var arr = pendingSwarms.slice(0);
                emptyPending();
                arr.forEach(function (swarm){
                    if(dslUtil.handleErrors(swarm)){
                        persistSwarmState.async(swarm);
                    }
                    sendSwarm(swarm);
                });
            }
        }

        if(!currentSwarm.meta.failed){
            try {
                executeBlock(currentSwarm, "done");
                doRunPending();
            } catch(err){
                currentSwarm.meta.failed = false;
            }
        }

        if(dslUtil.handleErrors(currentSwarm)){
            if(currentSwarm.meta.failed) {
                emptyPending();
                    executeBlock(currentSwarm, "failed");
                doRunPending();
                if(inTransaction(currentSwarm)){
                    finishTransaction(currentSwarm, "aborted");
                } else {
                    removeSwarmState(currentSwarm);
                }
            } else {
                if(inTransaction(currentSwarm)){
                    continueTransaction(currentSwarm);
                } else {
                    removeSwarmState(currentSwarm);
                }
            }
        }
    }

    /* save the swarm state and if transactionId is not false or undefined, register in the new transaction*/
    function persistSwarmState( swarm, callback){
        var group = swarm.meta.targetGroup;
        if(!group){
            throw new Error("Target group can't be null " + swarm);
        }
        var redisKey = makeRedisKey("savedCurrentlyExecutingPhases", group);

        /*
        if(willNotBeInTransaction(swarm)){
            delete swarm.meta.transactionId;
        } else
        if(willStartTransaction(swarm)){
            swarm.meta.transactionId = generateUUID();
        } */

        var ret = redisClient.hset.async(redisKey,swarm.meta.phaseIdentity,J(swarm));
        (function(ret){
            //add a member or start a transaction
            if(swarm.meta.transactionId){
                redisKey = makeRedisKey("transactionStart", swarm.meta.transactionId);
                var ret = redisClient.hset.async(redisKey,swarm.meta.phaseIdentity, swarm.meta.targetGroup);
                (function(ret){
                    callback(null,true);
                }).wait(ret);
            }  else {
                callback(null,true);
            }

        }).wait(ret);
    }

    function assertNodeInGroup(node, group){
        if(node.indexOf(group) != 1){
            throw new Error("Invalid node " + node + " in group " + group);
        }
    }

    function incNodeUse(groupNode, specificNode, offset){
        if(!offset){
            offset = 1 ;
        }
        assertNodeInGroup(specificNode,groupNode);
        var redisKey = makeRedisKey("groupMembers",groupNode);
        //console.log("Modifying counter: ", redisKey, specificNode, offset);
        redisClient.hincrby.async(redisKey,specificNode, offset);
    }

    function incGroupsUse(groupName){
        var redisKey = makeRedisKey("groups","members");
        redisClient.hincrby.async(redisKey,groupName, 1);
    }

    function decNodeUse(groupNode, specificNode){
        incNodeUse(groupNode, specificNode,-1);
    }

    /* is in transaction? */
    function inTransaction(swarm){
        return swarm.meta.transactionId;
    }


    /* progress and eventually trigger end */
    function continueTransaction(swarm){
        var stepKey = makeRedisKey("transactionStep", swarm.meta.transactionId);
        swarm.meta.currentStage = "done";
        persistSwarmState.async(swarm);
        var counterAdded = redisClient.hset.async(stepKey,swarm.meta.phaseIdentity,swarm.meta.targetGroup);
        (function(counterAdded){
            var startKey = makeRedisKey("transactionStart", swarm.meta.transactionId);
            var counterStarted   = redisClient.hlen.async(redisKey);
            var counterCompleted = redisClient.hset.async(stepKey);
            (function(counterStarted,counterCompleted){
                if(counterStarted == counterCompleted){
                    finishTransaction(swarm,"finished", function(){
                        //everything is fine, delete both keys
                        redisClient.del.async(startKey);
                        redisClient.del.async(stepKey);
                    });
                    //any need to notify all
                }
            }).wait(counterStarted,counterCompleted);
        }).wait(counterAdded);
    }

    /* notify all about abortion or success*/
    function finishTransaction(swarm, how, endFunction){
        var startKey = makeRedisKey("transactionStart", swarm.meta.transactionId);
        var members = redisClient.hgetall.async(startKey, swarm.meta.phaseIdentity);
        (function(members){
                for(var p in members){
                self.restartSwarm(members[p], p, how);
            }
            endFunction();
        }).wait(members);
    }

    function willNotBeInTransaction(swarm){
        var phase = swarm[swarm.meta.currentPhase];
        if(phase["code"]){
            return true;
        }
        return false;
    }

    function willStartTransaction(swarm){
        if(swarm.meta.transactionId){
            return false;
        }
        var phase = swarm[swarm.meta.currentPhase];
        if(phase["transaction"]){
            return true;
        }
        return false;
    }

    /* remove swarm state */
    function removeSwarmState(swarm){
        var group = swarm.meta.targetGroup;
        if(group){
            var redisKey = makeRedisKey("savedCurrentlyExecutingPhases", group);
            redisClient.hdel.async(redisKey,swarm.meta.phaseIdentity);
            decNodeUse(group,swarm.meta.targetNodeName);
        } else {
            logger.error("Failed to remove saved swarm execution");
        }
    }

    /* restart swarm */
    this.restartSwarm = function(group, phaseIdentity, stage){
        var redisKey = makeRedisKey("savedCurrentlyExecutingPhases", group);
        var swarm = redisClient.hget.async(redisKey,phaseIdentity);
        (function(swarm){
            var state = JSON.parse(swarm);
            if(stage){
                state.meta.currentStage = stage;
            }
            var counter;
            if(state.meta.rebornCounter){
                counter = parseInt(state.meta.rebornCounter);
                counter++;
            } else {
                counter = 0;
            }
            state.meta.rebornCounter = counter;
            if(counter < MAX_REBORNCOUNTER){
                sendSwarm(state);
            } else {
                logger.error("Exceptional error: a swarm got restarted ", MAX_REBORNCOUNTER, " times and will not be restarted anymore. Developer intervention is required to understand what happens!");
            }
        }).wait(swarm);
    }

    var previousKnown = {};
    /*
        detect all swarm phases previously seen
        This functions should be called in a periodical timer from monitoring system with timeouts depending on SLA, QOS...
     */
    this.tickForStaleSwarms = function(handleStale){
        function mkObjectFromArray(arr){
            var ret = {}
            for(var i = 0,l = arr.length;i<l;i++){
                ret[i] = i;
            }
            return ret;
        }

        if(!handleStale){
            handleStale = this.restartSwarm;
        }
        var oldPrevious = previousKnown;
        previousKnown = {};
        var groupsKey = makeRedisKey("groupMembers", "*");
        var groups = redisClient.keys.async(groupsKey);

        function getNodeNameFromKey(g){
            var a = g.split(":");
            return a[a.length-1];
        }

        (function(groups){
            groups.forEach(function(g){
                var g = getNodeNameFromKey(g);
                var key = makeRedisKey("savedCurrentlyExecutingPhases", g);
                var phases = redisClient.hgetall.async(key);
                (function(phases){
                    previousKnown[g] = phases;
                    for(var p in phases){
                        if(oldPrevious[g] && oldPrevious[g][p]){
                            //in both lists  means thai it is a stale swarm phase or very slow execution..
                            console.log("Restarting phase ",  p, " in ", g);
                            try{
                                var o = JSON.parse(oldPrevious[g][p]);
                                o.targetNodeName = undefined;
                                handleStale(g, p, o.meta.stage);
                            }catch(err){
                                logger.error("Wrong swarm serialisation of " + oldPrevious[g][p], err);
                            }
                        }
                    }
                }).wait(phases);
            })
        }).wait(groups);
    }

    function executeBlock(swarm, blockName){
        swarm.meta.currentStage = blockName;  // "done", "failed", "aborted", "finished";
        if(dslUtil.blockExist(swarm, blockName)){
            thisAdapter.executeMessage(swarm);
        }
    }

    /*
        Save all global contexts
     */
    this.saveSharedContexts = function(arr){
        for(var i = 0,l = arr.length; i<l; i++){
            var ctxt = arr[i];
            var redisKey = makeRedisKey("sharedContexts", ctxt.__meta.contextId);
            ctxt.diff(function(propertyName, value){
                if(value === undefined){
                    console.log("Deleting in ", redisKey, propertyName);
                    redisClient.hdel.async(redisKey, propertyName);
                } else {
                    console.log("Adding in ", redisKey, propertyName);
                    redisClient.hset.async(redisKey, propertyName, value);
                }
             });
         }
    }

    this.deleteContext = function(ctxt){
        var redisKey = makeRedisKey("sharedContexts", ctxt.__meta.contextId);
        redisClient.del.async(redisKey);
    }

    /*
        get a global context
     */
    this.getSharedContext = function(contextId, callback){
        var redisKey = makeRedisKey("sharedContexts",contextId);
        var values = redisClient.hgetall.async(redisKey);
        (function(values){
            var ctxt = require("./SharedContext.js").newContext(contextId,values);
            callback(null, ctxt);
        }).wait(values);
    }


    var totalPhaseCounter = 0;
    /* pottential to add additional locking/verifications before executing a received swarm */
    this.asyncExecute = function(swarm, callback){
        if(limiter.accept(1)){
            totalPhaseCounter++;
            saveHistoricNodeInfo(thisAdapter.nodeName, "executedPhasesCounter", totalPhaseCounter);
            callback.apply(swarm);
        } else {
            logger.throttling("Limit exceeded, throttling requests!");
        }
    }

    var homeHandler;
    this.registerHomeSwarmHandler = function(callback){
        homeHandler = callback;
    }

    /* wait for swarms on the queue named uuidName*/
    this.subscribe = function(uuidName, callback){
        pubsubRedisClient.subscribe(uuidName);
        pubsubRedisClient.on("subscribe", function(){

        });

        pubsubRedisClient.on("message", function (channel, message){
            try{
                var msg = JSON.parse(message);

            } catch(err){
                logger.error("Malformed JSON response received\n" + message, err );
            }

            try{
                if(homeHandler && msg.meta.honeyRequest){
                    homeHandler(msg);
                } else {
                    callback(msg);
                }
            }catch(err){
                logger.error("Unknown error when executing\n" + message, err );
            }

        });
    }

    /*
     * publish a swarm in the required queue
     * */
    function sendSwarm(swarm){

        function doSend(specificNodeName){
            dprint("Sending swarm towards " + specificNodeName + " swarm:" + M(swarm));

            swarm.meta.targetNodeName = specificNodeName;
            if(dslUtil.handleErrors(swarm)){
                persistSwarmState.async(swarm);
                incNodeUse(swarm.meta.targetGroup, specificNodeName);
            }
            redisClient.publish(specificNodeName, J(swarm), function(error,result){
                if(result == 0){
                    // the node is down, force cleaning and retry the send
                    var success = waitToForceblyCleanNode.async(specificNodeName);
                    (function(success){
                            if(!success){
                                logger.logError("Dropping swarm " + swarm.meta.swarmingName + " targeted towards dead node or group: " + swarm.meta.targetNodeName);
                                return ;
                            }
                            if(swarm.meta.targetGroup){
                                var alternative = chooseOneFromGroup.async(swarm.meta.targetGroup);
                                (function(alternative){
                                    if(alternative  == "null"){
                                        logger.warning("Dropping swarm " + swarm.meta.swarmingName + " targeted towards dead node: " + specificNodeName);
                                    } else {
                                        doSend(alternative);
                                    }
                                }).wait(alternative);
                            } else {
                                logger.logError("Dropping swarm " + swarm.meta.swarmingName + " targeted towards dead node: " + specificNodeName);
                            }
                    }).wait(success);
                }
            });
        }

        if(!swarm.meta.targetNodeName){
            var targetNodeName  = chooseOneFromGroup.async(swarm.meta.targetGroup);
            (function(targetNodeName ){
                doSend(targetNodeName);
            }).wait(targetNodeName);
        } else {
            if(!swarm.meta.targetGroup){
                var nodeMainGroup = findMainGroup.async(swarm.meta.targetNodeName);
                (function(nodeMainGroup){
                    swarm.meta.targetGroup = nodeMainGroup;
                    doSend(swarm.meta.targetNodeName);
                }).wait(nodeMainGroup, function(err){
                        console.log("Failing to send swarm ", swarm.meta.swarmingName,"towards invalid node ", swarm.meta.targetNodeName);
                    });
            } else {
                assertNodeInGroup(swarm.meta.targetNodeName, swarm.meta.targetGroup);
                doSend(swarm.meta.targetNodeName);
            }
        }
    }

    var mainGroupPrefix = "UNDEFINED";
    /**
     *Make channels REDIS keys relative to current coreId
     * @param nodeName
     * @return {String}
     */
    this.mkAdapterId = function (groupName) {
        mainGroupPrefix = groupName+"#";
        return mainGroupPrefix + generateUUID();
    }

    /* get a dictionary of the the registered nodes in group and their current load*/
    this.getGroupNodes = function(groupName, callback){
        var redisKey = makeRedisKey("groupMembers",groupName);
        var values = redisClient.hgetall.async(redisKey);
        (function(values){
            callback(null, values);
        }).wait(values);
    }

    function isNodeName(queueName){
        return queueName[0] == '_';
    }

    var roundRobinIndex = 0;

    function chooseOneFromGroup(groupName, callback){
        if(groupName == thisAdapter.mainGroup){
            //allays send to the same node if a message is requested for the same group from the same group
            callback(null,thisAdapter.nodeName);
            return ;
        }

        var redisKey = makeRedisKey("groupMembers",groupName);
        var values = redisClient.hgetall.async(redisKey);
        (function(values){
            var sortable = [];
            for (var v in values){
                if(v != groupName){
                    sortable.push([v, parseInt(values[v])]);
                } else {
                    logger.warning("Group " + v + " found as member in group: " + groupName );
                }
            }
            if(sortable.length >0){
                sortable.sort(function(a, b) {return a[1] - b[1]});
                var smallerValue = sortable[0][1];
                var c = 0;
                while(c < sortable.length && sortable[c][1] == smallerValue){
                    c++;
                }
                roundRobinIndex++;
                roundRobinIndex%=c;
                //console.log("Choosing ", roundRobinIndex);
                callback(null,sortable[roundRobinIndex][0]);
            } else {
                callback(null,"null");
                if(groupName != "Logger"){
                    logger.info("Missing any node in group [" + groupName + "]\n")
                } else{
                    container.outOfService("networkLogger");
                    console.log("Warning: Logger adapter is out of service...");
                    //localLog("missing","Error: Missing any logger!!!\n");
                }
            }
        }).wait(values);
    }

    function doJoin(groupName, isMain){
        var redisKey = makeRedisKey("groupMembers",groupName);
        redisClient.hset.async(redisKey, thisAdapter.nodeName, 0);

        redisKey = makeRedisKey("groupsForNode", thisAdapter.nodeName);
        var groupNameValue = groupName;
        if(isMain){
            groupNameValue = "mainGroup";
        }
        redisClient.hset.async(redisKey, groupName, groupNameValue);
    }

    this.joinGroup = function(groupName, isMain){

        if(self.redisReady){
            incGroupsUse(groupName);
            doJoin(groupName, isMain);
        } else {
         pendingInitialisationCalls.push(function(){
             incGroupsUse(groupName);
             doJoin(groupName, isMain);
         });
        }
    }

    function saveHistoricNodeInfo(nodeName, type, value){
        var redisKey = makeRedisKey("historicInfo",nodeName);
        var result = redisClient.hset.async(redisKey, type, value);
        /*(function(result){
         callBack(null, result);
         }).swait(result);*/
    }

    function getNodeGroups(nodeName, callback){
        var redisKey = makeRedisKey("groupsForNode", nodeName);
        redisClient.hgetall(redisKey,callback);
    }

    function registerInSharedDB(){
        startSwarm("CoreWork.js", "register", thisAdapter.mainGroup, thisAdapter.nodeName);
    }

    function waitToForceblyCleanNode(nodeName, callback){
        if(nodeName == "null"){
            callback(null, false);
            return ;
        }

        var nodes = getNodeGroups.async(nodeName);
        (function(nodes){
            console.log("Clearing redis information about dead node ", nodeName);
            for(var groupName in nodes){
                var redisKey = makeRedisKey("groupMembers",groupName);
                var res = redisClient.hdel.async(redisKey, nodeName);
                saveHistoricNodeInfo(nodeName, "stopAcknowledgedBy", thisAdapter.nodeName);
                saveHistoricNodeInfo(nodeName, "stopTime",Date.now());

                if(nodes[groupName] == "mainGroup"){
                    (function(res){
                        //return result
                        callback(null, true);
                    }).wait(res);
                }
            }
            //clean group information for the dead node
            var redisKey = makeRedisKey("groupsForNode", nodeName);
            redisClient.del.async(redisKey);
            //clean RegisteredNodes key
            redisKey = makeRedisKey("sharedContexts","System:RegisteredNodes");
            redisClient.del.async(redisKey, nodeName);
        }).wait(nodes);
    }

    function findMainGroup(nodeName, callback){
        var nodes = getNodeGroups.async(nodeName);
        (function(nodes){
            for(var v in nodes){
                if(nodes[v] == "mainGroup"){
                    callback(null,v);
                    return ;
                }
            }
            callback(new Error("No main group for " + nodeName), null);
        }).wait(nodes);
    }

    this.setSwarmTarget = function(swarm, proposedTarget){
        if(isNodeName(proposedTarget)){
            swarm.meta.targetNodeName = proposedTarget;
            swarm.meta.targetGroup = null;
        } else {
            swarm.meta.targetGroup =  proposedTarget;
            swarm.meta.targetNodeName = null;
        }
    }

    this.uploadDescriptions = function(){
        if(self.redisReady){
            console.log("Redis ready...");
            uploadDescriptionsImpl();
        } else {
            self.uploadDescriptionsRequired = true;
        }
    }

    function uploadDescriptionsImpl() {
        function validJsFile(fullFileName){
            try{
                var content = fs.readFileSync(fullFileName).toLocaleString();
                var obj = eval(content);
                //console.log(obj);
                return true;
            }catch(err){
                //console.log("Got error:",err.code,  err)
                return false;
            }
            return true;
        }

        var folders = thisAdapter.config.Core.paths;
        for (var i = 0; i < folders.length; i++) {
            if (folders[i].enabled == undefined || folders[i].enabled == true) {
                var descriptionsFolder = folders[i].folder;
                if(!descriptionsFolder){
                    descriptionsFolder = getSwarmESBCorePath(folders[i].core);
                }
                console.log("Uploading folder ", descriptionsFolder);
                var files = fs.readdirSync(getSwarmFilePath(descriptionsFolder));
                files.forEach(function (fileName, index, array) {
                    if(fileName == ".DS_Store") return;
                    var fullFileName = getSwarmFilePath(descriptionsFolder + "/" + fileName);
                    fs.watchFile(fullFileName, function (event, chFileName) {
                        if (validJsFile(fullFileName) &&  uploadFile(fullFileName, fileName)) {
                            startSwarm("CoreWork.js", "swarmChanged", fileName);
                        }
                    });
                    uploadFile(fullFileName, fileName);
                });
            }
        }
        //startSwarm("NodeStart.js","boot");
    }

    /**
     *  Make REDIS keys relative to current coreId
     * @param type
     * @param mainBranch
     * @param subBranch
     * @return {String}
     */
    function makeRedisKey(type, mainBranch, subBranch){
        if(subBranch){
            return thisAdapter.coreId+":"+type+":"+ mainBranch + ":" + subBranch;
        }
        return thisAdapter.coreId+":"+type+":"+ mainBranch;
    }

    this.makeRedisKey = makeRedisKey;

    function uploadFile(fullFileName, fileName) {
        try {
            var content = fs.readFileSync(fullFileName).toString();
            dprint("Uploading swarm: " + fullFileName);

            if(dslUtil.repository.compileSwarm(fileName, content)){
                redisClient.hset.async(makeRedisKey("system", "code"), fileName, content);
            }
        }
        catch (err) {
            logger.hardError("Failed uploading swarm file ", err);
        }
        return true;
    }


    this.reloadAllSwarms = function () {
        var swarmCode = redisClient.hgetall.async(makeRedisKey("system", "code"));
        (function (swarmCode) {
            for (var i in swarmCode) {
                try{
                    if(i != ".DS_Store"){
                        dslUtil.repository.compileSwarm(i, swarmCode[i]);
                    }
                } catch(err){
                    console.log("Ignoring:", err);
                }
            }
            callWaitingForReady();
            registerInSharedDB();
            container.resolve("swarmsLoaded", {ready:true});
        }).wait(swarmCode);
    }

    this.reloadSwarm = function(swarmName){
        var swarmCode = redisClient.hget.async(makeRedisKey("system", "code"), swarmName);
        (function (swarmCode) {
            dslUtil.repository.compileSwarm(swarmName, swarmCode);
        }).wait(swarmCode);
    }



    this.observeGlobal = function(globalId, swarm, phaseName, target){
        var storageKey =  makeRedisKey("globalObservers");
        var observer = {
                "swarm":swarm,
                "phaseName":phaseName,
                "target":target
            };
        redisClient.hset(storageKey, globalId, J(observer));
    }

    this.notifyGlobal = function(globalId, __payload){
        var storageKey =  makeRedisKey("globalObservers");
        var observer = redisClient.hget.jasync(storageKey, globalId);
        (function (observer) {
            observer.swarm.__payload = __payload;
            continueSwarm(observer.swarm, observer.phaseName, observer.target);
        }).wait(observer);
    }

    var readyWaiting = [];
    function callWaitingForReady(){
        readyWaiting.forEach(function(c){
            c();
        });
        readyWaiting = null;
    }
    this.onReady = function(callback){
        if(readyWaiting == null){
            callback();
        } else {
            readyWaiting.push(callback);
        }
    }
}

var swarmComImpl = null;

exports.implemenation = (function(){
        if(!swarmComImpl){
        swarmComImpl = new RedisComImpl();
        }
        return swarmComImpl;
    })();


redisClient = function(){
    return thisAdapter.nativeMiddleware.privateRedisClient;
}


container.service("swarmingIsWorking", ['redisConnection', 'swarmsLoaded'], function(outofService, connection){

})
