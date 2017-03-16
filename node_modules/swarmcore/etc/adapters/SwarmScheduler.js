/*
  Adapter capable of starting periodically scheduled swarms. Experimental implementation. Should work together with Swarm Monitor
*/

var core = require ("../../lib/SwarmCore.js");
thisAdapter = core.createAdapter("Core");


var schedule = require('node-schedule');


function loadRules(){
    var redisKey = thisAdapter.nativeMiddleware.makeRedisKey("SwarmSchedulerRules");
    var rules = redisClient().hgetall.async(redisKey);
    (function(rules){
        console.log(rules);
        for(var m in rules){
            enableRule(JSON.parse(rules[m]));
        }
    }).swait(rules);
}

function logExecution(rule){
    //do nothing for now
}

function checkLogs(){
    //ToDO...
}



function enableRule(rule){
    schedule.scheduleJob(rule.config, function(){
        startSwarm.apply(null, rule.args);
        logExecution(rule);
    });
}


function saveRule(rule){
    var redisKey = thisAdapter.nativeMiddleware.makeRedisKey("SwarmSchedulerRules");
    var rules = redisClient().hset.async(rule.ruleName, J(rule));
}

removeRule = function(ruleName){
    var redisKey = thisAdapter.nativeMiddleware.makeRedisKey("SwarmSchedulerRules");
    var rules = redisClient().hdel.async(ruleName);
}

scheduleEveryDay  = function(ruleName, swarmName, ctor){
    var rule = {
        "ruleName":ruleName,
        args:mkArgs(arguments, 1),
        config: "* 1 * * *"
    }
    saveRule(rule);
    enableRule(rule);
}

scheduleEveryWeek = function(ruleName, swarmName, ctor){
    var rule = {
        "ruleName":ruleName,
        args:mkArgs(arguments, 1),
        config: "1 1 * * sun"
    }
    saveRule(rule);
    enableRule(rule);
}

scheduleEveryMonth = function(ruleName, swarmName, ctor){
    var rule = {
        "ruleName":ruleName,
        args:mkArgs(arguments, 1),
        config: "1 1 1 * *"
    }
    saveRule(rule);
    enableRule(rule);
}

scheduleEveryYear = function(ruleName, swarmName, ctor){
    var rule = {
        "ruleName":ruleName,
        args:mkArgs(arguments, 1),
        config: "1 1 1 1 *"
    }
    saveRule(rule);
    enableRule(rule);
}


/* [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] */
scheduleCronStyle = function(ruleName, config,  swarmName, ctor){
    var rule = {
        "ruleName":ruleName,
        args:mkArgs(arguments, 2),
        config: config
    }
    saveRule(rule);
    enableRule(rule);
}


loadRules();