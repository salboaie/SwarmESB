/**
 *
 * Swarm used by WebClientAdapter to send responses back
 *
 */
var VisitUser = {
    vars:{
    },
    response:function(userName, callingSwarm )  {
        this.callingSwarm  = callingSwarm;
        this.userName = userName;
        this.swarm("onResponse");
    },
    onResponse:{
        node:"SessionsRegistry",
        code : function (){
            sendSwarmToUser(this.userName, this.callingSwarm);
        }
    }
};

VisitUser;