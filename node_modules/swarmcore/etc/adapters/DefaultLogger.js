/*
 Simple logger implementation
 */
var core = require ("../../lib/SwarmCore.js");
thisAdapter = core.createAdapter("Logger");

recordLog = function(record){
 localLog("NetworkLog",record);
}
