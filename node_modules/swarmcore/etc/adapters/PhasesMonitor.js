/*
 Simple logger implementation
 */
var core = require ("../../lib/SwarmCore.js");
thisAdapter = core.createAdapter("PhasesMonitor");

var redisClient = function(){
    return thisAdapter.nativeMiddleware.privateRedisClient;
}

/*TO DO:
 - lista de grupuri: getAllGroups
 - lista de adaptori dintr-un grup: getGroupMembers
 - numarul de faze curente de pe fiecare adaptor: getGroupMembers returneaza asta
 - informatie despre un nod: getHistoricNodeInfo
        - retruneaza un obiect cu diferite informatii bune de afisat
        - tine informatii si despre adaptoarele oprite

 - functie in toate adaptoarele sa limiteze numarul de executii de faze posibile
     usage:  thisAdpater.nativeMiddleware.resetThrottler(limit, timeUnit) // see npm module limiter2

 - functie in ClientAdapter care sa limiteze numarul de swarm-uri noi lansate (cu startSwarm)
 usage:  resetStartSwarmThrottler(limit, timeUnit) // see npm module limiter2

 //NEXT:

 - eveniment pt reject swarm - standardizare faza reject, primitiva reject
 //optional
 - concept de broadcast in camera
        - outletJoinRoom(roomName)
        - outletLeaveRoom(roomName)
        - swarm.roomBroadcast(roomName)
- apeluri intre swarm-uri// asteptare revenire call
 */


/*
 get all Groups
*/
getAllGroups = function(callBack){
    var redisKey = thisAdpater.nativeMiddleware.makeRedisKey("groups","members");
    var result = redisClient().hgetall.async(redisKey);
    (function(result){
        callBack(null, result);
    }).swait(result);
}

/*
    Keep information about all nodes ever started
    Returns an object containing:
        - systemId                     //host machine id
        - mainGroup
        - startTime
        - stopTime
        - stopAcknowledgedBy            // who removed redis key
        - executedPhasesCounter         // all phases counter
        - pendingSwarmsCounterAtDelete  //not implemented
 */

getHistoricNodeInfo = function(nodeName, callBack){
    var redisKey = thisAdpater.nativeMiddleware.makeRedisKey("historicInfo",nodeName);
    var result = redisClient().hgetall.async(redisKey);
    (function(result){
        callBack(null, result);
    }).swait(result);
}


/*
    get all group Members and their current load
*/
getGroupMembers = function(groupName, callback){
    thisAdpater.nativeMiddleware.getGroupNodes(groupName, callback);
}

/*
    show phases awaiting execution (phases that were started, running now or just failed for some reason and waits for restart)
*/
getPhasesCounter = function(nodeName){
    var redisKey = thisAdpater.nativeMiddleware.makeRedisKey("groups","members");
    var result = redisClient().hgetall.async(redisKey);
    (function(result){
        callBack(null, result);
    }).swait(result);
}


/*

 */
setThrottlingLimit = function (){

}

/*
    For tests purposes
*/
delayPhaseExecution = function(timeOut){
    setTimeout(createSwarmCallback(function(){
        console.log("Delaying phase execution for ", timeOut, " milliseconds");
    }), timeOut);
}

/*
    setTimeout(function () {
        setInterval(function () {
         thisAdapter.nativeMiddleware.tickForStaleSwarms();
        }, 500);
    }, 500);
*/
