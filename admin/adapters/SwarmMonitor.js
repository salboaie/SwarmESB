/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
/*
    Cod Preluat din proiectul open source swam monitor. Nu e folosit momentan de
*/


var core        = require ("swarmcore");
var os          = require('os');
var fs          = require('fs');
var moment      = require('moment');
thisAdapter     = core.createAdapter("SwarmMonitor");

var config  = getMyConfig('SwarmMonitor');
var adminPhone = config.adminPhone;

var redisClient = function(){
    return thisAdapter.nativeMiddleware.privateRedisClient;
};



var container = require("semantic-firewall").container;


function cpuLoad(){
    var cpus = os.cpus();
    var percent = 0;
    for(var i = 0, len = cpus.length; i < len; i++) {
        //console.log("CPU %s:", i);
        var cpu = cpus[i], total = 0;
        for(t in cpu.times)
            total += cpu.times[t];
        for(t in cpu.times) {
            var p = Math.round(100 * cpu.times[t] / total);
            //console.log("\t", t, p);
            if(t == 'user' || t == 'sys' || t == 'nice'){
                percent += p;
            }
        }
    }
    return percent/cpus.length;
}

function memLoad() {
    return Math.round(os.freemem()* 100/os.totalmem());

}

function tick(rts){
    var cLoad = cpuLoad();
    var mLoad = memLoad();
    rts.record('cpu',cLoad, ['avg','max','min'], ['hm','hq','hy','dm','dq','dy']);
    rts.record('memory',mLoad, ['avg','max','min'], ['hm','hq','hy','dm','dq','dy']);
    console.log("CPU load "     +  cLoad + "%");
    console.log("Memory load "  +  mLoad + "%");

}


container.service("osMonitor", ["redisConnection"], function(outOfService,redis){
    var donotsave = false;
    if(outOfService){
        donotsave = true;
    } else {
        donotsave = false;
        //maybe instantiate rts out of this function ?
        var rts = require('rts')({
            redis: thisAdapter.nativeMiddleware.privateRedisClient,
            gran: '5m, 1h, 1d, 1w, 1M, 1y',
            points: 360,
            prefix: ''
        });

        function doTick(){
            console.log("Swarm monitor in action!!!!!!!!!!!!!");
            if(!donotsave){
                tick(rts);
            }
            setTimeout(doTick,10*1000);
        }
        doTick();
    }
})

var activeServers = {};
var activeServerLastChecked = {};
var cpuHistory = {};
var memoryHistory = {};



var periodToMiliseconds=function(period){
    //really ugly stuff...
    switch (period){
        case "Last 5 minutes": return 300000;
        case "Last hour": return 3600000;
        case "Last day": return 86400000;
        case "Last month": return 2592000000;
        case "Last year": return 31536000000;
    }
}


getCpuHistory=function(period) {
    var rts = require('rts')({
        redis: thisAdapter.nativeMiddleware.privateRedisClient,
        gran: '5m, 1h, 1d, 1w, 1M, 1y',
        points: 360,
        prefix: ''
    });
    ;
    length=new Date(periodToMiliseconds(period)); //the length of the period in date format; period is the number of miliseconds
    console.log("getCpuHistory:"+length);
    return{
        cpuHistory:rts.avg('cpu','5m',Date.now()-length,Date.now())  // '5m?....should be dependent on the period
        }
};
getMemHistory=function(period){
    var rts = require('rts')({
        redis: thisAdapter.nativeMiddleware.privateRedisClient,
        gran: '5m, 1h, 1d, 1w, 1M, 1y',
        points: 360,
        prefix: ''
    });
    ;
    length=new Date(periodToMiliseconds(period)); //the length of the period in date format; period is the number of miliseconds
    console.log("getMemHistory:"+length);
    return{
        memoryHistory:rts.avg('mem','5m',Date.now()-length,Date.now()),
        info:{totalMemory:os.totalmem()}
    }
};



/////////////////////////////////////////////////

updateSystemLoad = function(info) {
    //console.log("Update system load : %j",info);
    var systemId = info.systemId;
    
    if (!memoryHistory[systemId]) {
        memoryHistory[systemId] = [];
    }

    memoryHistory[systemId].push({
        time: info.time,
        usedMemory: info.usedMemory
    });

    if (!cpuHistory[systemId]) {
        cpuHistory[systemId] = [];
    }

    cpuHistory[systemId].push({
        time: info.time,
        cpuLoad: info.cpuLoad
    });
};


listSwarms = function(callBack){
    var redisKey = thisAdapter.nativeMiddleware.makeRedisKey("system","code");
    var result = redisClient().hkeys.async(redisKey);
    (function(result){
        callBack(null, result);
    }).swait(result);
};

loadSwarm = function(swarmName, callBack){
    var redisKey = thisAdapter.nativeMiddleware.makeRedisKey("system","code");
    var result = redisClient().hget.async(redisKey,swarmName);
    (function(result){
        callBack(null, result);
    }).swait(result);
};
