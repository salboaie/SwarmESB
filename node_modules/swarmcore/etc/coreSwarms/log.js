/**
 * Standard logging infrastructure
 *
 */
var logSwarming = {
    meta:{
        name:"log.js"
    },

    record:function(record){
        this.record         = record;
        this.swarm("doRecord");
    },
    recordBuffer:function(buffer){
        this.buffer         = buffer;
        this.swarm("doBufferRecord");
    },
    ping:function(){
        this.pingStarter         = thisAdapter.nodeName;
        this.swarm("doPing");
    },
    doRecord:{
        node:"Logger",
        code : function (){
            recordLog(this.record);
        }
    },
    doBufferRecord:{
        node:"Logger",
        code : function (){
            recordBufferLog(this.buffer);
        }
    },
    doPing:{
        node:"Logger",
        code : function (){
            this.swarm("doPong", this.pingStarter);

        }
    },
    doPong:{
        node:"*",
        code : function (){
            require("safebox").container.resolve("networkLogger", true);
        }
    }
};

logSwarming;