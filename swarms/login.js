
var loginSwarming =
{
    vars:{
        isOk:false,
        sessionId:null,
        debug:"true1"
    },
    start:function(clientSessionId,userId,authorisationToken){
        this.isOk=false;
        this.sessionId   = clientSessionId;
        this.userId     = userId;
        this.authorisationToken  = authorisationToken;
        this.swarm("check");
    },
    check:{ //phase that should be replaced. Use your own security provider adaptor
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
        node:"ClientAdaptor",
        code : function (){
            logInfo("Successful login for user " + this.userId + " in session " + this.sessionId + " and tenant " + this.tenantId );
            findOutlet(this.sessionId).successfulLogin(this);
            this.swarm("home",this.sessionId);
        }
    },

    home:{   //phase executed on client
        node:"$client",
        code : null
    },

    failed:{   //phase
        node:"ClientAdaptor",
        code : function (){
            logInfo("Failed login for " + this.userId + " in session " + this.sessionId + " and tenant " + this.tenantId );
            findOutlet(this.sessionId).close();
        }
    }
};

loginSwarming;