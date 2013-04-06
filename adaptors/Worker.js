/*
    Workers, do work under control of a load balancer
 */

thisAdapter = require('swarmutil').createAdapter();
thisAdapter.join("WorkersGroup");

doWork = function(){
    cprint("Worker " + thisAdapter.nodeName + " is working hard!");
}



