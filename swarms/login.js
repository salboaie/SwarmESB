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

/*
 TODO: check to be clean in production, this is an ideal place where you can put a backdoor for your authentication
 */

sessionsRegistry = require("../lib/SessionRegistry.js").getRegistry();

var loginSwarming = {
    meta: {
        debug: false
    },
    vars: {
        authenticated: false,
        sessionId: null,
        userId: null
    },
    userLogin: function (email, password) {

        console.log("USER LOGIN",arguments);

        this.email = email;
        this.password = password;
        this.swarm('inputValidationCheck');
    },

    inputValidationCheck: {
        node: "UsersManager",
        code: function () {

            if (!this.email || this.email.length === 0 || !this.password || this.password.length === 0) {
                this.swarm('failed', this.getEntryAdapter());
                return;
            }
            else {
                this.sessionId = this.getSessionId();
                this.authenticated = false;
                this.clientAdapter = thisAdapter.nodeName;
                this.swarm('checkPassword');
            }
        }
    },

    checkPassword: {
        node: "UsersManager",
        code: function () {
            var self = this;
            validateUser(this.email, this.password, S(function (err, userId) {
                delete self.authorisationToken;
                if (err) {
                    self.error = err.message;
                    self.swarm("failed", self.getEntryAdapter());
                }
                else if (userId) {
                    self.userId = userId;
                    self.authenticated = true;
                    self.swarm("createOrUpdateSession");
                }
            }));
        }
    },

    logout: function () {
        console.log("Logout. Destroying session ",this.getSessionId());
        this.swarm("userLogout");
    },

    userLogout: {
        node: "SessionManager",
        code: function () {
            var self = this;
            deleteSession(this.getSessionId(), S(function (err, result) {
                if (err && err.message !== "session_not_found") {
                    console.log(err);
                }
                else {
                    self.home("logoutSucceed");
                    sessionsRegistry.disableOutlet(self.meta.outletId);
                }
            }));
        }
    },

    restoreSession: function (userId, clientSessionId) {
        console.log(this.meta.sessionId, clientSessionId);
        if (clientSessionId == null || clientSessionId == undefined) {
            this.home("restoreFailed");
        }
        else {
            console.log("Let's restore session");
            this.sessionId = clientSessionId;
            this.userId = userId;
            this.swarm("getOutlets", this.getEntryAdapter());
        }
    },

    registerNewOSPOrganisation:function(organisationData){
        console.log(organisationData);
        console.log("New OSP register request", organisationData);
        this.ospData = organisationData;
        this.swarm("verifyOSPData");
    },

    verifyOSPData:{
        node: "UsersManager",
        code: function () {
            var self = this;
            newUserIsValid(self.ospData, S(function (err, user) {
                if (err) {
                    console.log(err);
                    self.status = "error";
                    self.error = err.message;
                    self.newUser = {};
                    self.home("error");
                } else {
                    self.user = user;

                    startSwarm("emails.js", "sendEmail", "no-reply@" + thisAdapter.config.Core.operandoHost,
                        user['email'],
                        "Activate account",
                        "Your account has been registered \nTo activate it, please access the following link:\n " + thisAdapter.config.PlusPrivacy.OSPHost + "/#/verify/" + user.activationCode);

                    //send notification to OSP
                    startSwarm("emails.js", "sendEmail", "no-reply@" + thisAdapter.config.Core.operandoHost,
                        "psp@plusprivacy.com",
                        "New OSP request",
                        "A new OSP request was made from:\n" +
                        "Name: " + self.ospData['name'] + "\n" +
                        "Email: " + self.ospData['email'] + "\n" +
                        "Please review it accept or deny it");

                    self.swarm("registerOSPRequest");

                }
            }))
        }
    },

    registerOSPRequest: {
        node: "OSPRequests",
        code: function () {
            var self = this;
            registerNewOSPRequest(self.user.userId, this.ospData, S(function(err, ospDetails){
                self.swarm("setRealIdentity");
            }))

        }
    },

    getOutlets: {
        node: "EntryPoint",
        code: function () {
            var outlets = sessionsRegistry.findOutletsForSession(this.sessionId);
            if(!outlets || outlets.length === 0){

                this.home("restoreFailed");
                this.oldSessionId = this.sessionId;
                this.newSessionId = this.getSessionId();
                this.swarm("removeOldSession");

            }
            else {
                for (var v in outlets) {
                    if (outlets[v].getSessionId() === this.sessionId) {
                        this.restoredOutletId = outlets[v].getOutletId();
                        this.swarm("validateSession");
                        break;
                    }
                }
            }
        }
    },

    removeOldSession:{
        node:"SessionManager",
        code: function(){
            var self = this;
            deleteSession(self.oldSessionId, S(function(err){
                if(err){
                    self.error = err.message;
                    self.home("restoreFailed");
                }
                else{
                    self.swarm("renewUserSession");
                }
            }))
        }
    },

    renewUserSession:{
        node:"SessionManager",
        code: function(){
            var self = this;
            var sessionData = {
                userId:this.userId,
                sessionId:this.newSessionId
            };
            createOrUpdateSession(sessionData, S(function(err,session){
                if(err){
                    self.error = err.message;
                    self.home("restoreFailed");
                }
                else
                if(session){
                    console.log("A new session was created!");
                    self.sessionId = session.sessionId;
                    self.authenticated = true;
                    self.setSessionId(self.sessionId);
                    self.swarm("restoreSwarms", self.getEntryAdapter());
                }
            }));
        }
    },

    validateSession: {
        node: "SessionManager",
        code: function () {
            var self = this;

            if (!self.sessionId) {
                self.home("restoreFailed");
            }

            else {
                sessionIsValid(self.sessionId, self.userId, S(function (err, newSession) {

                    if (err) {
                        console.log(err);
                        self.home("restoreFailed");
                    }
                    else {
                        if (newSession) {
                            console.log("Session is valid");
                            self.sessionId = newSession.sessionId;
                            self.authenticated = true;
                            self.setSessionId(self.sessionId);
                            self.swarm("restoreSwarms", self.getEntryAdapter());
                        }
                        else {
                            self.home("restoreFailed");
                        }
                    }
                }));
            }

        }
    },

    validateAuthenticationToken :{
        node:"SessionManager",
        code:function() {
            var self = this;
            validateAuthenticationToken(this.userId, this.getSessionId(), this.authenticationToken, S(function (err, session) {
                delete self['authenticationToken'];
                if (err) {
                    console.log(err);
                    delete self['userId'];
                    self.home("tokenLoginFailed");
                }
                else {
                    console.log("Authentication token validated!");
                    self.sessionId = session.sessionId;
                    self.meta.userId = self.userId;
                    self.authenticated = true;
                    self.swarm("enableSwarmsFromTokenAuthentication", self.getEntryAdapter());
                }
            }));
        }
    },

    //It is not used anywhere
    reconnectInSession: function (clientSessionId, userId, secretToken) {
        this.authenticated = false;
        this.setSessionId(clientSessionId);
        this.userId = userId;
        this.secretToken = secretToken;
        this.swarm("reconnect");
    },
    testCtor: function (clientSessionId, userId, authorisationToken) {
        this.authenticated = false;
        this.userId = userId;
        this.authorisationToken = authorisationToken;
        this.clientAdapter = thisAdapter.nodeName;
        console.log("Password: ", authorisationToken);
        if (authorisationToken == "ok") {
            this.authenticated = true;
            cprint("enabling... " + this.clientAdapter);
            this.swarm("enableSwarms", this.getEntryAdapter());
        } else {
            this.swarm("failed", this.getEntryAdapter());
            cprint("disabling... " + this.clientAdapter);
        }
    },
    emailLoginCtor: function (clientSessionId, userId, authorisationToken) {
        this.authenticated = false;
        this.userId = userId;
        this.authorisationToken = authorisationToken;
        this.clientAdapter = thisAdapter.nodeName;
        if (authorisationToken == "haraka") {
            this.authenticated = true;
            cprint("enabling... " + this.clientAdapter);
            this.swarm("enableSwarms", this.getEntryAdapter());
        } else {
            this.swarm("failed", this.getEntryAdapter());
            cprint("disabling... " + this.clientAdapter);
        }
    },
    reconnect: {   //add this new outlet in sessions
        node: "EntryPoint",
        code: function () {
            var outlets = sessionsRegistry.findOutletsForSession(this.getSessionId());
            for (var v in outlets) {
                if (outlets[v].getSecret() == this.secretToken) {
                    this.swarm("enableSwarm", this.getEntryAdapter());
                    return;
                }
            }
            this.home("failed");
        }
    },
    failed: {   //phase
        node: "EntryPoint",
        code: function () {
            sessionsRegistry.disableOutlet(this.meta.outletId);
            logger.info("Failed login for " + this.userId);
            this.home("failed");
        }
    },
    enableSwarms: {
        node: "EntryPoint",
        code: function () {
            console.log("swarms enabled",this.userId);
            this.meta.userId = this.userId;
            var outlet = sessionsRegistry.getTemporarily(this.meta.outletId);
            sessionsRegistry.registerOutlet(outlet);
            enableOutlet(this);
            console.log("Success !");
            if(this.email==="guest@operando.eu"){
                this.home("success_guest");
            }
            else{
                this.home("success");
            }
        }
    },
    restoreSwarms: {
        node: "EntryPoint",
        code: function () {
            var outlet = sessionsRegistry.getTemporarily(this.meta.outletId);
            sessionsRegistry.registerOutlet(outlet);
            enableOutlet(this);
            outlet.renameSession(this.getSessionId());
            this.home("restoreSucceed");
        }
    },
    enableSwarmsFromTokenAuthentication:{
        node:"EntryPoint",
        code:function(){
            var outlet = sessionsRegistry.getTemporarily(this.meta.outletId);
            sessionsRegistry.registerOutlet(outlet);
            enableOutlet(this);
            outlet.renameSession(this.getSessionId());
            this.home("tokenLoginSuccessfully");
        }
    },

    createOrUpdateSession: {
        node: "SessionManager",
        code: function () {
            var self = this;
            if (this.sessionId == null || this.sessionId == undefined) {
                this.sessionId = this.getSessionId();
            }
            var sessionData = {
                userId: self.userId,
                sessionId: self.sessionId
            };

            createOrUpdateSession(sessionData, S(function (error, session) {
                if (error) {
                    console.log(error);
                    self.home("restoreFailed");
                }
                else {
                    if(session.authenticationToken){
                        self.authenticationToken = session.authenticationToken;
                    }
                    self.swarm("enableSwarms", self.getEntryAdapter());
                }
            }));
        }
    },
    setRealIdentity :{
        node:"IdentityManager",
        code:function(){
            var self = this;
            setRealIdentity(this.user, S(function(err, identity){
                if(err){
                    console.log(err);
                    self.error = err.message;
                    self.home('error');
                }
                else{
                    console.log("Real identity added", identity);
                    self.home("success");
                }
            }));
        }
    }
};

loginSwarming;