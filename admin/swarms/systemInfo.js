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
        name:"systemInfo.js",
        debug:false
    },
    vars:{

    },
    startAll:function(){
        this.broadcast("getSystemInfo");
    },
    getSystemInfo:{ 
        node:"SystemAdapter",
        code : function (){
            this.systemInfo = {
                systemId: systemId(),
                hostName: hostName(),
                type: systemType(),
                platform: platform(),
                architecture: architecture(),
                uptime: uptime(),
                totalMemory: totalMemory(),
                freeMemory: freeMemory(),
                cpus: cpus()
            };
            this.home("done");
        }
    }
};

swarmDescription;
