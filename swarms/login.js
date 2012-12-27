/**
 *
 * Login swarm, version 2
 */

//TODO: check to be clean in production, it is an ideal place where you can put a backdoor for your authentication
var loginSwarming =
{
    meta:{
        debug: true,
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
        //this.identity = generateUID();
        this.authenticated      = false;
        this.setSessionId(clientSessionId);
        this.userId             = userId;
        this.forceSessionId     = authorisationToken;
        if(authorisationToken == "ok"){
            this.swarm("enableSwarms",this.clientAdapter);
            //this.swarm("register");
        } else{
            this.swarm("failed", this.clientAdapter);
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
            logInfo("Successful login for user " + this.userId);
            var outlet = thisAdapter.findOutlet(this.getSessionId());
            if(outlet){
                outlet.successfulLogin(this);
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
            var outlet = thisAdapter.findOutlet(this.getSessionId());
            if(outlet){
                outlet.destroy();
            } else {
                logErr("Unknown outlet for session "+ this.getSessionId());
            }
        }
    }
};

loginSwarming;

