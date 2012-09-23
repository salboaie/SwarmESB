
//var redis = require("../api/redis.js").newRedisContext();
var redis = require("redis").createClient();

var util = require("swarmutil");

var MAXRUN = 100000;

redis.del("bugtest/room");
redis.del("bugtest/follow");

redis.sadd("bugtest/follow","Tester");


function assertTest(err,ret){
    if(ret[0]!= "Tester"){
        max = MAXRUN;
        console.log("Buggy return: " + ret);
        util.delayExit("Race condition got reproduced!!!!",1000);
    }
}

var max = 0;
function fire(fcall,size,tmout){
    for(var i=0;i<=size;i++){
        fcall();
        max++;
    }

    if(max < MAXRUN){
        setTimeout(function (){
            fire(fcall,size,tmout);
        },tmout);
    }
    else{
        util.delayExit("Voila...",1000);
    }
}

fire(function(){
    redis.lpush("bugtest/room","message"+max);
}, 400, 1);


fire(function(){
    redis.smembers("bugtest/follow",assertTest);
}, 500, 1);


fire(function(){
    redis.lrange("bugtest/room",1,100);
}, 10, 10);

