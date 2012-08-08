/*
    Workers, do work under control of a load balancer
 */

var uuid = require('node-uuid');
var workerId = "worker:" + uuid.v4();

require('swarmutil').createAdapter(workerId,onReadyCallback);

function onReadyCallback(){
    startSwarm("WorkerManagement.js","register",workerId);
}


doWork = function(){
    //do something
}

