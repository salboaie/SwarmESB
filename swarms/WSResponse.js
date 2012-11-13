
var WSResponse = {
    vars:{
    },
    response:function(callingSwarm, target, requestId)  {
        this.callingSwarm  = callingSwarm;
        this.requestId = requestId;
        this.swarm("onResponse", target);
    },
    onResponse:{
        node:"",
        code : function (){
            onRequestResponse(this.callingSwarm, this.requestId);
        }
    }
};

WSResponse;