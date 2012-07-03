
var loginSwarming =
{
    vars:{
        isOk:false,
        sessionId:null,
        debug:"swarm1"
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
            console.log("Successful login for " + this.userId);
            thisAdaptor.findOutlet(this.sessionId).successfulLogin(this);
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
            thisAdaptor.findOutlet(this.sessionId).close();
        }
    }
};

loginSwarming;