
var loginSwarming =
{
    vars:{
        isOk:false,
        sessionId:null,
        debug:"true1"
    },
    testCtor:function(clientSessionId,userId,authorisationToken){
        this.identity = generateUID();
        //this.loginTimeOut = this.timeoutSwarm(2000,"checkLoginTimeout","ClientAdapter");
        this.isOk               = false;
        this.sessionId          = clientSessionId;
        this.userId             = userId;
        this.authorisationToken = authorisationToken;
        this.swarm("check");

    },
    ldap:function(clientSessionId,userId,authorisationToken){
        this.isOk=false;
        this.sessionId   = clientSessionId;
        this.userId     = userId;
        this.authorisationToken  = authorisationToken;
        this.swarm("check");
    },
    check:{
        node:"Core",
        code : function (){
            cprint("Login passed!");
            if(this.authorisationToken == "ok"){
                this.isOk=true;
                this.swarm("success");
            }
            else{
                this.swarm("failed");
            }
        }
    },
    success:{   //phase
        node:"ClientAdapter",
        code : function (){
            this.deleteTimeoutSwarm(this.loginTimeOut);
            logInfo("Successful login for user " + this.userId);
            var outlet = findOutlet(this.sessionId);
            outlet.successfulLogin(this);
            this.swarm("home",this.sessionId);
            outlet.loginSucces = true;
        }
    },

    home:{   //phase executed on client
        node:"$client",
        code : null
    },

    checkLoginTimeout:{   //phase
        node:"ClientAdapter",
        code : function (){
            var outlet = findOutlet(this.sessionId);
            cprint("Timeout for Outlet " + outlet.sessionId + " Succes:" + outlet.loginSucces );
        }
    },
    failed:{   //phase
        node:"ClientAdapter",
        code : function (){
            this.deleteTimeoutSwarm(this.loginTimeOut);
            logInfo("Failed login for " + this.userId );
            this.swarm("failed",this.sessionId);
            findOutlet(this.sessionId).close();
        }
    }
};

loginSwarming;