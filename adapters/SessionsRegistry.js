/**
 *  This adapter has the role of registering:
    * the entry adapter of a session
    * the tenant of a session
    * load information about sessions (number of requests,etc)
 *
 */
var util = require('swarmutil');
thisAdapter = require('swarmutil').createAdapter("SessionsRegistry");

//var api = require("../api/redis.js");
//var redisContext = api.newRedisContext(thisAdapter.redisPort,thisAdapter.redisHost,"channel-data");

var redisContext = require("redis").createClient(thisAdapter.redisPort,thisAdapter.redisHost);

function sessionInfo(sessionId){
    this.sessionId = sessionId;
    this.onCloseSwarms = {};
}

var sessions = {};
var users = {};



function rememberUserSession(userId, sessionInfo) {
    if(!users[userId]){
        users[userId] = {};
    }
    users[userId][sessionInfo.sessionId] = sessionInfo;
}


registerSession = function(sessionId, swarm){
        var session             = new sessionInfo(sessionId);
        session.sessionId       = sessionId;
        session.outletId        = swarm.meta.outletId;
        session.tenantId        = swarm.tenantId;
        session.entryAdapter    = swarm.entryAdapter;
        session.userId          = swarm.userId;
        sessions[sessionId]     = session;
        rememberUserSession(swarm.userId, session);

        cprint("Registering session " + sessionId , " Sessions:" + J(sessions) );

}

registerSession("intern", {
    sessionId   :"intern",
    entryAdapter: "RestAdapter",
    userId      : "system",
    tenantId    : "systemTenant",
    meta:{

    }
});

dropSession = function(sessionId){
    console.log("Session dropped " + sessionId ,  " Sessions:" + J(sessions));
    var session             = sessions[sessionId];

    if(session){
        /*for(var v in session.onCloseSwarms){
            console.log("Reviving phase " + session.onCloseSwarms[v].phase + " session:" + sessionId );
            reviveSwarm(session.onCloseSwarms[v].swarm,session.onCloseSwarms[v].phase);
        } */
        var userId = session.userId;
        delete users[userId][sessionInfo.sessionId];
        delete sessions[sessionId];
    } else {
        cprint("Unknown error when dropping " + sessionId);
    }
}


/*
addCloseSwarmOnSession = function(sessionId, caseName, swarm, phaseName ){
   // console.log("addCloseSwarmOnSession: " + sessionId , " Sessions:" + J(sessions));
    var session        = sessions[sessionId];
    if(session){
        session.onCloseSwarms[caseName] = {"phase":phaseName,"swarm":swarm};
    } else {
        cprint("Scheduling close operations on invalid session " + sessionId);
    }
} */



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

sendSwarmToUser = function (userName, swarm, phaseName, noSessionSwarm,noSessionPhase){
    if(phaseName == undefined){
        phaseName = "toUser";
    }

    var swarming = util.newSwarmPhase(swarm.meta.swarmingName, phaseName , swarm);
    var sessions =  users[userName];
    var counter = 0;
    for(var s in sessions){
        var session = sessions[s];
        swarming.meta.toUserRequest = true;
        swarming.meta.entryAdapter = session.entryAdapter;
        swarming.meta.sessionId = session.sessionId;
        if(session.entryAdapter == undefined){
            console.log("Swarming toUser towards undefined with session dump: " + J(session));
        } else {
            swarming.swarm(phaseName, session.entryAdapter);
            counter++;
        }
    }

    /*
    if(counter == 0 && noSessionSwarm != undefined ){
        var swarming = util.newSwarmPhase(noSessionSwarm.meta.swarmingName, noSessionPhase , noSessionSwarm);
        swarming.swarm(noSessionPhase);
    } */
}

userIsLoggedIn = function(userName){
    var sessions =  users[userName];
    for(var s in sessions){
        console.log(userName + " has active session " + s);
        return true;
    }
    return false;
}

