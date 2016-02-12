var core        = require ("swarmcore");
thisAdapter     = core.createAdapter("SwarmCA");
var config  = getMyConfig('SwarmCA');
var container = require("safebox").container;



var currentRedisConnection = null;

container.service("SwarmCA", ["redisConnection"], function(outOfService,redisConnection){
    var donotsave = false;
    if(outOfService){
        donotsave = true;
    } else {
        currentRedisConnection = redisConnection;
        if(!redisConnection){
            throw new Error("Shared Redis connection can't be null!");
        }

    }
})