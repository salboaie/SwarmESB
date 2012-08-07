/*
    Workers, do work under control of a load balancer
 */

var uuid = require('node-uuid');
var workerId = "worker:" + uuid.v4();

var thisAdaptor;
thisAdapter = require('swarmutil').createAdaptor(workerId,onReadyCallback);

function onReadyCallback(){
    startSwarm("WorkerManagement.js","register",workerId);
}


doWork = function(){
    //do something
}

