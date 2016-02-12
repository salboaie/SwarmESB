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

var rts;

var container = require("safebox").container;


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
}

var currentRedisConnection = null;

container.service("osMonitor", ["redisConnection"], function(outOfService,redisConnection){
    var donotsave = false;
    if(outOfService){
        donotsave = true;
    } else {
        currentRedisConnection = redisConnection;
        if(!redisConnection){
            throw new Error("Shared Redis connection can't be null!");
        }
        donotsave = false;
        //maybe instantiate rts out of this function ?
         rts = require('rts')({
            redis: redisConnection,
            gran: '1m, 5m, 1h, 1d, 1w, 1M, 1y',
            points: 360,
            prefix: ''
        });

        function doTick(){
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



var queryParametersDetermination=function(period){
    //really ugly stuff...
    switch (period){
        case "Last 5 minutes": return {
            periodLength:300000,
            granularity:"1m"
        };
        case "Last hour"     : return {
            periodLength:3600000,
            granularity:"5m"
        };

        case "Last day"      : return {
            periodLength:86400000,
            granularity:"1h"
        };
        case "Last month"    : return {
            periodLength:2592000000,
            granularity:"1d"
        };
        case "Last year"     : return {
            periodLength:31536000000,
            granularity:"1M"
        };
    }
};


getCpuHistory=function(period,callback) {
    var end=Date.now();
    var queryParams=queryParametersDetermination(period);
    var begin=new Date(end-queryParams.periodLength);
    rts.getStat('avg','cpu',queryParams.granularity,begin,end,callback);
};


getMemoryHistory=function(period,callback) {
    var end = Date.now();
    var queryParams = queryParametersDetermination(period);
    var begin = new Date(end - queryParams.periodLength);
    rts.getStat('avg', 'memory', queryParams.granularity, begin, end, callback);
};

getFreeMemory=function(){
    return os.freemem();
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
    var result = currentRedisConnection.hkeys.async(redisKey);
    (function(result){
        callBack(null, result);
    }).swait(result);
};

loadSwarm = function(swarmName, callBack){
    var redisKey = thisAdapter.nativeMiddleware.makeRedisKey("system","code");
    var result = currentRedisConnection.hget.async(redisKey,swarmName);
    (function(result){
        callBack(null, result);
    }).swait(result);
};
