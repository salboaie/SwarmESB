/**
 * Created by TAC on 6/25/2015.
 */
var core = require ("swarmcore");
thisAdapter = core.createAdapter("DemoBroadcast");

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