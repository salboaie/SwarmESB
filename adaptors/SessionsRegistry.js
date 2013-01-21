/**
 *  This adapter has the role of registering:
    * the entry adapter of a session
    * the tenant of a session
    * load information about sessions (number of requests,etc)
 *
 */
var util = require('swarmutil');

thisAdapter = require('swarmutil').createAdapter("SessionsRegistry");

function sessionInfo(sessionId){
     this.sessionId = sessionId;
}

var sessions = {};
var users = {};

registerSession = function(sessionId, swarm){
    var session             = new sessionInfo(sessionId);
    session.sessionId       = sessionId;
    session.tenantId        = swarm.tenantId;
    session.entryAdapter    = swarm.entryAdapter;
    session.userId          = swarm.userId;
    sessions[sessionId]     = session;
    users[swarm.userId]     = session;

    cprint("Register session " + sessionId + " from "+ session.entryAdapter);
}

dropSession = function(sessionId, swarm){
    delete sessions[sessionId];
}

activityInSession = function(sessionId, swarm){
    var session = sessions[sessionId];
    session.lastActivity = time();
    session.counter++;
}

getTenantForSession = function(sessionId){
    cprint("Looking up for session " + sessionId);
    var session = sessions[sessionId];
    if(session){
        return session.tenantId;
    }
    return undefined;
}

sendSwarmToUser = function (userName, swarm){
    var swarming = util.newSwarmPhase(swarm.meta.swarmingName, "toUser", swarm);
    var session =  users[userName];
    if(session){
        swarming.meta.honeyRequest = true;
        swarming.meta.entryAdapter = session.entryAdapter;
        swarming.swarm("toUser", session.entryAdapter);
    } else{
        cprint("Dropping message towards offline user " + userName);
        //
    }
}


