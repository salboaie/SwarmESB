
var loginSwarming =
{
    vars:{
        isOk:false,
        sessionId:null,
        debug:"true1"
    },
    testCtor:function(clientSessionId,userId,authorisationToken){
        this.isOk=false;
        this.sessionId   = clientSessionId;
        this.userId     = userId;
        this.authorisationToken  = authorisationToken;
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
            logInfo("Successful login for user " + this.userId);
            findOutlet(this.sessionId).successfulLogin(this);
            this.swarm("home",this.sessionId);
        }
    },

    home:{   //phase executed on client
        node:"$client",
        code : null
    },

    failed:{   //phase
        node:"ClientAdapter",
        code : function (){
            logInfo("Failed login for " + this.userId );
            this.swarm("failed",this.sessionId);
            findOutlet(this.sessionId).close();

        }
    }
};

loginSwarming;