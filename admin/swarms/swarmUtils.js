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
        name:"swarmUtils.js",
        debug:false
    },
    vars:{

    },
    list:function(){
        this.swarm('getSwarms');
    },
    read:function(swarmName) {
        this.swarmName = swarmName;
        this.swarm('getSwarmDescription');
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
