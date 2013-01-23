/**
 *
 * Login swarm, version 2
 */

//TODO: check to be clean in production, it is an ideal place where you can put a backdoor for your authentication
var loginSwarming =
{
    meta:{
        debug: false,
        renameSession:false
    },
    vars:{
        authenticated:false
    },
    testCtor:function(clientSessionId,userId,authorisationToken){
        this.authenticated      = false;
        this.setSessionId(clientSessionId);
        this.userId             = userId;
        this.authorisationToken = authorisationToken;
        this.clientAdapter = thisAdapter.nodeName;
        if(authorisationToken == "ok"){
            //this.swarm("register");
            this.swarm("enableSwarms",this.clientAdapter);
        } else{
            this.swarm("failed", this.clientAdapter);
        }
    },
    testForceSessionId:function(clientSessionId,userId,authorisationToken){
        this.authenticated      = false;
        this.clientAdapter      = thisAdapter.nodeName
        this.setSessionId(clientSessionId);
        this.userId             = userId;
        this.forceSessionId     = authorisationToken;
        if(authorisationToken == "testSession"){
            this.swarm("renameSession",this.clientAdapter);
            //this.swarm("register");
        } else{
            this.swarm("failed", this.clientAdapter);
        }
    },
    authenticate:function(clientSessionId, userId, authorisationToken){
        this.authenticated = false;
        this.clientAdapter = thisAdapter.nodeName;

        this.setSessionId(clientSessionId);

        this.userId             = userId;
        this.authorisationToken = authorisationToken;
        
        this.swarm("validateAuth",this.clientAdapter);
    },
    validateAuth:{
        node: ";ClientAdapter",
        code: function() {
                    var success = function(data)
                    {
                        this.isOk = true;
                        this.authorization = data;
                        this.forceSessionId = data['token'];
                        this.swarm("renameSession", this.clientAdapter);
                    }.bind(this);

                    var failed = function(data)
                    {
                        this.swarm("failed",this.clientAdapter);
                    }.bind(this);
                    makeCall(this.authorisationToken,success,failed);
               }
    },
    register:{
        node: "@SessionManagers",
        code: function() {
            registerValidSession(this.getSessionId());
            this.swarm("enableSwarms", this.clientAdapter);
        }
    },
    enableSwarms:{   //phase
        node:"this.clientAdapter",
        code : function (){
            var outlet = thisAdapter.findOutlet(this.meta.outletId);
            dprint("Enabling outlet:" + this.meta.outletId);
            if(outlet){
                outlet.successfulLogin(this);
                logInfo("Successful login for user " + this.userId );
                this.home("authenticated");
            } else{
                logErr("Could not enable swarms for "+ this.getSessionId());
            }
        }
    },
    failed:{   //phase
        node:"this.clientAdapter",
        code : function (){
            logInfo("Failed login for " + this.userId );
            this.home("failed");
            var outlet = thisAdapter.findOutlet(this.meta.outletId);
            if(outlet){
                outlet.destroy();
            } else {
                logErr("Unknown outlet for session "+ this.getSessionId());
            }
        }
    },
    renameSession: {
        node:";ClientAdapter",
        code : function () {
            var outlet = thisAdapter.findOutlet(this.meta.outletId);
            outlet.renameSession(this.forceSessionId);
            this.setSessionId(this.forceSessionId);
            this.meta.changeSessionId = true;
            //outlet.successfulLogin(this);
            //console.log('Session set for ' + this.userId + ' [' + this.getSessionId() + ']');
            this.swarm("enableSwarms", this.clientAdapter);
        }
    }
};

loginSwarming;

