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

function rememberUserSession(userId, sessionInfo) {
    if(!users[userId]){
        users[userId] = [];
    }
    users[userId][sessionInfo.sessionId] = sessionInfo;
}
registerSession = function(sessionId, swarm){
    var session             = new sessionInfo(sessionId);
    session.sessionId       = sessionId;
    session.outletId         = swarm.meta.outletId;
    session.tenantId        = swarm.tenantId;
    session.entryAdapter    = swarm.entryAdapter;
    session.userId          = swarm.userId;
    sessions[sessionId]     = session;
    rememberUserSession(swarm.userId, session);

    cprint("Register session " + sessionId + " from outlet: "+ swarm.meta.outletId);
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
    var sessions =  users[userName];
    for(var s in sessions){
        var session = sessions[s];
        swarming.meta.toUserRequest = true;
        swarming.meta.entryAdapter = session.entryAdapter;
        swarming.meta.sessionId = session.sessionId;
        swarming.swarm("toUser", session.entryAdapter);
    }

     //cprint("Dropping message towards offline user " + userName);
}


