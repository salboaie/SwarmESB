/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */


/*
 Cod Preluat din proiectul open source swam monitor. Nu e folosit momentan de USMED
 */


var swarmDescription = {
    meta:{
        name:"ping.js",
        debug:false
    },
    vars:{

    },
    queryLaunchers:function(){
        this.broadcast('doLauncherStatus');
    },
    queryMonitors:function(period){
        this.period = period;
        this.broadcast('doMonitorStatus');
    },
    doLauncherStatus:{
        node:"Launcher",
        code : function (){
            this.status = getLauncherStatus();
            this.home("launcherStatus");
        }
    },
    doMonitorStatus:{
        node:"SwarmMonitor",
        code: function() {
            this.status = getLauncherStatus();
            this.home("monitorStatus");
        }
    }
};

swarmDescription;
