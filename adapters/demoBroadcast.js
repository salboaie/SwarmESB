/**
 * Created by TAC on 6/25/2015.
 */
var core = require ("swarmcore");
thisAdapter = core.createAdapter("DemoBroadcast");
var container = require("safebox").container;

var instances = {};

initCounter = function(UID, value) {
    console.log("Init ",value);
    if(!instances[UID]) {
        instances[UID] = value;
    }
    else{
        instances[UID] += value;
    }
}

decCounter = function(UID) {
    console.log("Dec ", instances[UID]);
    if (!instances[UID]) {
        instances[UID] = 0;
    }
    instances[UID]--;
}

getCounter = function(UID){
    console.log("Get ",instances[UID]);
    return instances[UID];
}

adapterDebugMessage = function (msg, callback) {
    console.log(msg);
    if (callback) callback();
};

/*
container.declareDependency("DemoServiceForTestAndExamples", ["swarmingIsWorking"], function(outOfService, swarmingIsWorking){
    if(!outOfService){
        function  launchParallelSwarms(PARALLEL_SWARMS){
            for (var worker=1; worker < PARALLEL_SWARMS; worker ++ ) {
                startSwarm('ParallelSwarmsTest.js', "start", worker);
            }

        }

        launchParallelSwarms(5);
    }
})

*/