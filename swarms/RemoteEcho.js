/*
   Swarm for testing startRemoteSwarm
 */
var remoteEcho = {
    meta:{
    },
    vars:{
        debug:true,
        echoSource:null
    },
    start:function (param1, param2) {
        var assert              = require('assert');
        cprint("Started remote echo in session " + this.getSessionId() + " " + this.meta.outletId);
        assert.equal(param1,'testParam1');
        assert.equal(param2,'testParam2');
        this.echoSource = thisAdapter.nodeName ;
        this.success = "OK";
        this.home("notify");
    }
}

remoteEcho;
