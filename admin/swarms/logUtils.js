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
        name:"logUtils.js",
        debug:false
    },
    vars:{

    },
    list:function(){
        this.broadcast('getLogFiles');
    },
    read:function(loggerId, fileName) {
        this.fileName = fileName;
        this.swarm('readLogFile', loggerId);
    },
    getLogFiles:{
        node:"Logger",
        code: function() {
            this.files = listFiles();
            this.systemId = thisAdapter.systemId;
            this.loggerId = getNodeId();
            this.home('doneList');
        }
    },
    readLogFile:{
        node:"Logger",
        code: function() {
            this.content = readContent(this.fileName);
            this.home('doneRead');
        }
    }
};

swarmDescription;
