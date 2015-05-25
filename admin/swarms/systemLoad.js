/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */

/*
 Cod Preluat din proiectul open source swam monitor. Nu e folosit momentan de USMED
 */


var swarmDescription =
{
    meta:{
        name:"systemLoad.js",
        debug:false
    },
    vars:{

    },
    start:function(){
        this.broadcast("getSystemLoad");
    },
    getSystemLoad:{
        node:"SystemAdapter",
        code:function (){
            var self = this;
            self.systemInfo = {
                systemId: systemId(),
                usedMemory: totalMemory() - freeMemory(),
                time: new Date()
            };
            var promise = cpuLoad.async();
            (function(result){
                self.systemInfo.cpuLoad = result;
                self.broadcast("notifyMonitor");
            }).swait(promise);
        }
    },
    notifyMonitor:{
        node:"SwarmMonitor",
        code:function() {
            updateSystemLoad(this.systemInfo);
        }
    }
};

swarmDescription;
