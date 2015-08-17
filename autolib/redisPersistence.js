
var persistenceModule = require("apersistence");

redisPersistence = null;

var container=require("semantic-firewall").container;


container.declareDependency("redisPersistence", ["redisConnection"], function(outOfService, redisConnection){
    if(!outOfService){
        console.log("Initialising Redis persistence...");
        redisPersistence = persistenceModule.createRedisPersistence(redisConnection);
    }
})