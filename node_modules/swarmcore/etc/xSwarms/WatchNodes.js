/**
 *
 * WatchNodes.js swarm is used to clean from Redis database all the invalid nodes:
 *  very busy nodes,
 *  crushed nodes and sort of zombie (hopefully no one)
 *  killed nodes
 *
 * Cleaned nodes will receive no other swarms
 */
var WatchNodes = {
    meta:{
        name:"WatchNodes.js",
        debug:false
    },
    vars:{
    },
    alivePulse:function(timeOut){
        this.timeOut = timeOut;
        this.swarm("doAlivePulse", thisAdapter.nodeName);
    },
    doAlivePulse:{
        node:"Logger",
        code : function (){
            var self = this;
            var ctxt = getSharedContext.async("System:RegisteredNodes");
            (function(ctxt){
                self.ctxt = {};
                for(var v in ctxt){
                    if(ctxt.hasOwnProperty(v) && v != "__meta"){
                        self.ctxt[v] = ctxt[v];
                    }
                }
                self.swarm("doCleanings", thisAdapter.nodeName);
            }).swait(ctxt);
        }
    },
    doCleanings:{
    node:"Logger",
        code : function (){
            var self = this;
            this.randomUUID = "CleaningZone/"+generateUUID();
            var ctxt = this.ctxt;
            delete this.ctxt; //do not share in all nodes
            for(var v in ctxt){
                console.log("Checking ", v);
                this.swarm("confirmAlive", v);
            }

            setTimeout(function(){
                try{
                    var aliveCtxt = getDisconectedSharedContext.async(self.randomUUID); //manual saving required
                    var rnContext = getDisconectedSharedContext.async("System:RegisteredNodes");
                    (function(aliveCtxt, rnContext){
                        console.log("Alive nodes:", aliveCtxt);
                        for(var v in ctxt){
                            if(!aliveCtxt[v]){
                                console.log("Cleaning informations about dead node: ", v);
                                rnContext.deleteProperty(v);
                                thisAdapter.nativeMiddleware.forceblyCleanNode(v,ctxt[v])
                            }
                        }
                        thisAdapter.nativeMiddleware.saveSharedContexts([rnContext]);
                        thisAdapter.nativeMiddleware.deleteContext(aliveCtxt);
                    }).wait(aliveCtxt, rnContext);
                }catch(err){
                    console.log(err);
                }
            }, this.timeOut);
        }
    },
    confirmAlive: { //running in all adapters
        node:"",
        code : function (){
            console.log("I'm alive...");
            var ctxt = getSharedContext.async(this.randomUUID);
            (function(ctxt){
                ctxt[thisAdapter.nodeName] = thisAdapter.mainGroup;
            }).swait(ctxt);
        }
    }
};

WatchNodes;