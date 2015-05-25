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
        name:"monitorClient.js",
        debug:false
    },
    vars:{

    },
    activeServers:function(){
        this.swarm('getActiveServers');
    },
    loadHistory:function(systemId) {
        this.systemId = systemId;
        this.swarm('getLoadHistory');
    },
    systemLoad:function() {
        this.broadcast('getSystemLoad');
    },
    listSwarms:function(){
        this.swarm('getSwarms');
    },
    loadSwarm:function(swarmName){
        this.swarmName = swarmName;
        this.swarm('getSwarmDescription');
    },
    getActiveServers:{
        node:"SwarmMonitor",
        code: function() {
            this.serversInfo = getActiveServers();
            this.home('done');
        }
    },
    getLoadHistory:{
        node:"SwarmMonitor",
        code: function() {
            this.cpuLoadHistory = getCPULoadHistory(this.systemId);
            this.memoryLoadHistory = getMemoryLoadHistory(this.systemId);
            this.home('loadDone');
        }
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
                self.home('loadCheckDone');
            }).swait(promise);
        }
    },
    getSwarms:{
        node:"SwarmMonitor",
        code: function() {
            var self = this;
            var promise = listSwarms.async();
            (function(result){
                self.swarmList = result;
                self.home('listSwarmsDone');
            }).swait(promise);
        }
    },
    getSwarmDescription:{
        node:"SwarmMonitor",
        code: function() {
            var self = this;
            var promise = loadSwarm.async(this.swarmName);
            (function(result){
                self.swarmDescription = result;
                self.home('loadSwarmDone');
            }).swait(promise);
        }
    }
};

swarmDescription;
