
var apersistence = require("apersistence");
var container=require("safebox").container;
var redis = require('redis');

var redisClient = undefined;


redisPersistence = undefined;
function provideRedisClient(){
    redisClient = redis.createClient();

    redisClient.on("error",function(err){
        console.log("Redis client encountered error "+err);
        container.outOfService("redisClient");
        provideRedisClient();
    });


    redisClient.on('connect',function(){
        console.log("Redis client available");
        container.resolve("redisClient",redisClient);
    });
}

provideRedisClient();


container.declareDependency("redisPersistence", ["redisClient"], function(outOfService,redisClient){
    if(!outOfService){
        console.log("Initialising Redis persistence...");
        redisPersistence = apersistence.createRedisPersistence(redisClient);
        return redisPersistence;
    }else{
        console.log("Redis persistence failed");
    }
});