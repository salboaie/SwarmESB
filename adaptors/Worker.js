/*
    Workers, do work under control of a load balancer
 */

var uuid = require('node-uuid');
var workerId = uuid.v4();

var thisAdaptor;
thisAdaptor = require('swarmutil').createAdaptor(workerId,onReadyCallback);

function onReadyCallback(){
    startSwarm("Worker.js","register",workerId);
}


doWork = function(){
    //do something
}

