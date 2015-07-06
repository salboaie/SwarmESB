/**
 *
 *  swarm used to record activities that happen per session and other utilities
 *
 */
var sessionActivity = {
    vars:{
        debug:"false"
    },
    start:function(sessionId,tenantId, userId){
        this.tenantId       = tenantId;
        this.sessionId      = sessionId;
        this.userId         = userId;
        this.entryAdapter   = thisAdapter.nodeName;
        console.log("Starting new session for " + userId , this.sessionId  );
        this.swarm("onStart");
    },
    activity:function(sessionId)  {
        this.swarm("onActivity");
    },
    close:function(sessionId)  {
        this.sessionId      = sessionId;
        this.entryAdapter   = thisAdapter.nodeName;
        this.swarm("onClose");
    },
    onStart:{
        node:"SessionsRegistry",
        code : function (){
            registerSession( this.sessionId, this);
        }
    },
    onActivity:{
        node:"SessionsRegistry",
        code : function (){
            activityInSession( this.sessionId, this);
        }
    },
    onClose:{
        node:"SessionsRegistry",
        code : function (){
            console.log("Droping "+ this.sessionId, J(this.meta.phaseStack));
            dropSession( this.sessionId, this);
        }
    }
};

sessionActivity;