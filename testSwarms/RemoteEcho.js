/*
   Swarm for testing startRemoteSwarm
 */
var remoteEcho = {
    meta:{
    },
    vars:{
        echoSource:null
    },
    start:function (param1, param2) {
        var assert              = require('assert');
        cprint("Started remote echo " + this.getSessionId());
        assert.equal(param1,'testParam1');
        assert.equal(param2,'testParam2');
        this.echoSource = thisAdapter.nodeName ;
        this.home("notify");
    }
}

remoteEcho;
