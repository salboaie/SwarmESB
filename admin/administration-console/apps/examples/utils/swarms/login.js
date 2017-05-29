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
	userLogin: function (email, authorisationToken) {
		console.log("userlogin email ",email);
		this.sessionId = this.getSessionId();
		this.authenticated = false;
		this.email = email;
		if (!email || email.length === 0) {
			this.swarm('failed', this.getEntryAdapter());
			return;
		}
		this.authorisationToken = authorisationToken;
		this.clientAdapter = thisAdapter.nodeName;
		this.swarm('checkPassword');
	},
	checkPassword: {
		node: "UsersManager",
		code: function () {
			var self = this;
			validateUser(this.email, this.authorisationToken, S(function (err, userId) {
				delete self.authorisationToken;
				if (err) {
					self.error = err.message;
					self.swarm("failed", self.getEntryAdapter());
				}
				else if (userId) {
					console.log(userId);
					self.userId = userId;
					self.authenticated = true;
					self.swarm("createOrUpdateSession");
				}
			}));
		}
	},
	logout: function () {
		console.log("logout");
		this.sessionId = this.getSessionId();
		this.swarm("userLogout");
	},
	userLogout: {
		node: "SessionManager",
		code: function () {
			var self = this;
			deleteUserSessions(this.getSessionId(), S(function (err, result) {
				if (err) {
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
			this.outletSession = this.getSessionId();
			this.email = userId;
			this.swarm("validateSession");
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
				sessionIsValid(self.outletSession, self.sessionId, self.email, S(function (err, newSession) {
					if (err) {
						console.log(err.message);
						self.home("restoreFailed");
					}
					else {
						if (newSession) {
							console.log("Session is valid");
							self.sessionId = newSession.sessionId;
							self.userId = newSession.userId;
							self.authenticated = true;
							self.swarm("restoreSwarms", self.getEntryAdapter());
						}
						else {
							self.home("restoreFailed");
						}
					}
				}));
			}
		}
	}
	,
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
	enableSwarms: {   //phase that is never executed... given as documentation
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
	restoreSwarms: {   //phase that is never executed... given as documentation
		node: "EntryPoint",
		code: function () {
			var outlet = sessionsRegistry.getTemporarily(this.meta.outletId);
			sessionsRegistry.registerOutlet(outlet);
			enableOutlet(this);
			this.meta.userId = this.userId;
			console.log("Session restored for ", this.userId, "!");
			this.home("restoreSucceed");
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
				}
				else {
					//console.log("Current session", session);
					self.swarm("enableSwarms", self.getEntryAdapter());
				}
			}));
		}
	},
	//copy from register.js
	//todo delete register.js
	registerNewUser: function (newUserData) {
		// console.log("New user register request", newUserData);
		newUserData.username = newUserData.email;
		this.newUser = newUserData;
		this.authorisationToken = newUserData.password;
		this.swarm("verifyUserData");
	},
	verifyUserData: {
		node: "UsersManager",
		code: function () {
			var self = this;
			createUser(self.newUser, S(function (err, user) {
				if (err) {
					console.log(err);
					self.status = "error";
					self.error = err.message;
					self.newUser = {};
					self.home(self.status);
				} else {
					self.sessionId = self.getSessionId();
					self.authenticated = false;
					self.email = user.email;
					self.clientAdapter = thisAdapter.nodeName;
					self.swarm('checkPassword');
				}
			}))
		}
	}
};
loginSwarming;