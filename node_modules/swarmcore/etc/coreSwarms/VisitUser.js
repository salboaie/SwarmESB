/**
 *
 * Swarm used by WebClientAdapter to send responses back
 *
 */
var VisitUser = {
    vars:{
        debug:true
    },
    transport:function(userId, callingSwarmSerialisation, phaseName)  {
        this.callingSwarm   = callingSwarmSerialisation;
        this.userId         = userId;
        this.phaseName      = phaseName;
        this.broadcast("findOutlet", "@ClientAdapters");
    },
    findOutlet:{
        node:"@ClientAdapters",
        code : function (){
            var outlets = sessionsRegistry.findOutletsForUser(this.userId);
            if(outlets){
                for(var v in outlets){
                    reviveSwarm(this.callingSwarm, this.phaseName, thisAdapter.nodeName, true, outlets[v]);
                }
            }
        }
    }
};

VisitUser;