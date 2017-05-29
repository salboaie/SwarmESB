var core = require("swarmcore");
core.createAdapter("SessionManager");

var apersistence = require('apersistence');
var container = require("safebox").container;

var myCfg = getMyConfig("SessionManager");

var sessionMaxIdleTime = 8640;//one day

if (myCfg.sessionTime != undefined) {
    sessionMaxIdleTime = myCfg.sessionTime;
}

var flow = require("callflow");

apersistence.registerModel("DefaultSession", "Redis", {
    userId: {
        type: "string",
        index :"true"
    },
    sessionId: {
        type: "string",
        pk: true,
        index: true
    },
    expirationDate: {
        type: "string"
    },
    ipAddress:{
        type:"string"
    }
}, function(err, model){
    if(err){
        console.log(model);
    }

});


createOrUpdateSession = function(sessionData, callback){
    flow.create("create or update Session", {
        begin: function () {
            if (!sessionData.userId) {
                callback(new Error('Empty userId'), null);
            }
            else {
                redisPersistence.lookup.async("DefaultSession", sessionData.sessionId, this.continue("createSession"));
            }
        },
        createSession: function (err, session) {
            sessionData.expirationDate = parseInt(Date.now()) + parseInt(sessionMaxIdleTime);
            redisPersistence.externalUpdate(session, sessionData);
            redisPersistence.saveObject(session, callback);
        }
    })();
}

deleteSession = function (sessionId, userId, callback) {
    flow.create("delete session", {
        begin: function () {
            redisPersistence.findById("DefaultSession", sessionId, this.continue("deleteSession"));
        },
        deleteSession: function (err, session) {
            if (err) {
                callback(err, null);
            }
            else {
                if (redisPersistence.isFresh(session)) {
                    callback(new Error("Could not find a session with id " + sessionId), null);
                }
                else {
                    redisPersistence.deleteById("DefaultSession", sessionId, callback);
                }
            }
        }
    })();
}

getUserBySession = function (sessionId, callback) {

    flow.create("delete all user sessions", {
        begin: function () {
            if (!sessionId) {
                callback(new Error("sessionId is required"), null);
            }
            else {
                redisPersistence.findById("DefaultSession", sessionId, this.continue("getUser"));
            }
        },
        getUser:function(err, session){
            if(err){
                callback(err, null);
            }
            else{
                callback(null, session.userId);
            }
        }
    })();
}

deleteUserSessions = function(sessionId,callback){
    var f = flow.create("delete all user sessions", {
        begin:function(sessionId, callback){
            this.callback = callback;
            if (!sessionId) {
                callback(new Error("sessionId is required"), null);
            }
            else{
                redisPersistence.findById("DefaultSession", sessionId, this.continue("findSessions"));
            }
        },
        findSessions: function(err, session) {
            if (err) {
                this.callback(err, null);
            }
            else if(session != null && session.userId) {
                redisPersistence.filter("DefaultSession", {"userId": session.userId}, this.continue("deleteUserSessions"));
            }
        },
        deleteUserSessions: function (err, sessions) {
            if (err) {
                this.callback(err, null);
            } else {
                var self = this;
                sessions.forEach(function(session){
                    self.deleteSingleSession(session);
                });
            }
        },
        deleteSingleSession:function(session){
            console.log(session);
            redisPersistence.delete(session);
        },

        end:{
            join:"deleteSingleSession",
            code:function(err, response){
                this.callback(err, response);
            }
        }
    });
    try{f(sessionId,callback)}catch(e){console.log(e);}

}

sessionIsValid = function (newSession, sessionId, userId, callback) {

    flow.create("validate session", {
        begin: function () {

            if (!sessionId) {
                callback(new Error("sessionId is required to validate session"), null);
                return;
            }

            if (!userId) {
                callback(new Error("userId is required to validate session"), null);
                return;
            }

            redisPersistence.findById("DefaultSession", sessionId, this.continue("validateSession"));

        },
        validateSession: function (err, session) {
            if (err) {
                callback(err, session);
            }
            else if (!session || redisPersistence.isFresh(session)) {
                callback(new Error("Session not found"), false);
            }
            else {
                if (parseInt(session.expirationDate) < parseInt(Date.now())) {
                    callback(new Error("Session is expired"), false);
                }
                else {
                    session.expirationDate = parseInt(Date.now()) + parseInt(sessionMaxIdleTime);
                    session.sessionId = newSession;
                    redisPersistence.saveObject(session, callback);
                }
            }
        }
    })();

}


container.declareDependency("SessionManagerAdapter", ["redisPersistence"], function (outOfService, redisPersistence) {
    if (!outOfService) {
        console.log("Enabling persistence...", redisPersistence);
    } else {
        console.log("Disabling persistence...");
    }
})
