/*
 * Copyright (c) 2016 ROMSOFT.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the The MIT License (MIT).
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *    RAFAEL MASTALERU (ROMSOFT)
 * Initially developed in the context of OPERANDO EU project www.operando.eu
 */

var core = require("swarmcore");
core.createAdapter("SessionManager");

var container = require("safebox").container;
var myCfg = getMyConfig("SessionManager");
var jwt = require('jsonwebtoken');
var sessionMaxIdleTime = 94608000;//one year
var sessionMinIdleTime = 8640;//one day
var persistence = undefined;
var flow = require("callflow");

if (myCfg.sessionTime != undefined) {
    sessionMaxIdleTime = myCfg.sessionTime;
}


function registerModels(callback){
    var models = [
        {
            modelName:"DefaultSession",
            dataModel : {
                userId: {
                    type: "string",
                    index :true,
                    length:254
                },
                sessionId: {
                    type: "string",
                    pk: true,
                    index: true,
                    length:254
                },
                expirationDate: {
                    type: "datetime"
                },
                ipAddress:{
                    type:"string",
                    length:254
                }
            }
        }

    ];

    flow.create("registerModels",{
        begin:function(){
            this.errs = [];
            var self = this;
            models.forEach(function(model){
                persistence.registerModel(model.modelName,model.dataModel,self.continue("registerDone"));
            });

        },
        registerDone:function(err,result){
            if(err) {
                this.errs.push(err);
            }
        },
        end:{
            join:"registerDone",
            code:function(){
                if(callback && this.errs.length>0){
                    callback(this.errs);
                }else{
                    callback(null);
                }
            }
        }
    })();
}

container.declareDependency("SessionManagerAdapter", ["mysqlPersistence"], function (outOfService, mysqlPersistence) {
    if (!outOfService) {
        persistence = mysqlPersistence;
        registerModels(function(errs){
            if(errs){
                console.error(errs);
            }
        });

    } else {
        console.log("Disabling persistence...");
    }
});


createOrUpdateSession = function(sessionData, callback){
    flow.create("create or update Session", {
        begin: function () {
            if (!sessionData.userId) {
                callback(new Error('Empty userId'), null);
            }
            else {
                persistence.lookup("DefaultSession", sessionData.sessionId, this.continue("createSession"));
            }
        },
        createSession: function (err, session) {
            this.sessionIsNew = false;
            if(persistence.isFresh(session)){
                this.sessionIsNew = true;
            }

            var currentDate = new Date();
            var currentDateTime = currentDate.getTime();
            sessionData.expirationDate = new Date(currentDateTime + parseInt(sessionMaxIdleTime));
            persistence.externalUpdate(session, sessionData);
            console.log("Before save",session);
            persistence.saveObject(session, this.continue("createAuthenticationToken"));
        },
        createAuthenticationToken :function(err, session){
            if(err){
                callback(err, null);
            }else{
                if (this.sessionIsNew === true) {
                    var token = jwt.sign(
                        {
                            sessionId: session.sessionId,
                            userId: session.userId
                        }, 'pulsatileTinnitus',{expiresIn:60});
                    session['authenticationToken'] = token;
                }

                callback(null, session);
            }
        }
    })();
};

generateAuthenticationToken = function(userId, sessionId, callback){
    var token = jwt.sign(
        {
            sessionId: sessionId,
            userId: userId
        }, 'pulsatileTinnitus', {expiresIn: 60});
    if (token) {
        callback(null, token);
    }
    else {
        callback(new Error("couldNotGenerateToken"), null);
    }
};

validateAuthenticationToken = function(userId, currentSession, authenticationToken, callback){
    flow.create("validateAuthenticationToken",{
        begin:function(){
            var self = this;
            jwt.verify(authenticationToken, 'pulsatileTinnitus', function(err, decoded) {
                if(err){
                    callback(err);
                }
                else {
                    if (decoded['userId'] === userId) {
                        self.next("createSession");
                    }
                    else {
                        callback(new Error("userIdTokenMismatch"));
                    }
                }
            });
        },
        createSession:function(){
            var sessionData = {
                sessionId:currentSession,
                userId:userId
            };
            createOrUpdateSession(sessionData, callback);
        }

    })();
};

deleteSession = function (sessionId, callback) {
    flow.create("delete session", {
        begin: function () {
            persistence.lookup("DefaultSession", sessionId, this.continue("deleteSession"));
        },
        deleteSession: function (err, session) {
            if (err) {
                callback(err, null);
            }
            else {
                if (persistence.isFresh(session)) {
                    callback(new Error("Could not find a session with id " + sessionId), null);
                }
                else {
                    persistence.deleteById("DefaultSession", sessionId, callback);
                }
            }
        }
    })();
};

getUserBySession = function (sessionId, callback) {

    flow.create("delete all user sessions", {
        begin: function () {
            if (!sessionId) {
                callback(new Error("sessionId is required"), null);
            }
            else {
                console.log("Session",sessionId);
                persistence.findById("DefaultSession", sessionId, this.continue("getUser"));
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
};

deleteUserSessions = function(session, callback){
    flow.create("delete all user sessions", {
        begin:function(){

            persistence.filter("DefaultSession", {"userId": session.userId}, this.continue("deleteUserSessions"));

        },
        deleteUserSessions: function (err, sessions) {
            if (err) {
                callback(err, null);
            } else {
                var self = this;
                sessions.forEach(function(session){
                    self.deleteSingleSession(session);
                });
            }
        },
        deleteSingleSession:function(session){
            console.log(session);
            persistence.delete(session);
        },

        end:{
            join:"deleteSingleSession",
            code:function(err, response){
                callback(err, response);
            }
        }
    })();
};

sessionIsValid = function (sessionId, userId, callback) {

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

            persistence.lookup("DefaultSession", sessionId, this.continue("validateSession"));

        },
        validateSession: function (err, session) {

            if (err) {
                callback(err, session);
            }
            else if (!session || persistence.isFresh(session)) {
                callback(new Error("Session not found"), null);
            }
            else {
                if (session.expirationDate < new Date() || session.userId !== userId) {
                    persistence.delete(session, function(){
                        callback(new Error("Session is expired"), false);
                    });
                }
                else {
                    var currentDate = new Date();
                    var currentDateTime = currentDate.getTime();
                    var expirationDate = new Date(currentDateTime + parseInt(sessionMaxIdleTime));

                    session['expirationDate'] = expirationDate;
                    persistence.saveObject(session, callback);
                }
            }
        }
    })();
};



