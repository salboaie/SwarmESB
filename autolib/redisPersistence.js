
var persistenceModule = require("apersistence");

redisPersistence = null;

registerResetCallback(function(){
    console.log("Initialising Redis persistence...");
    redisPersistence = persistenceModule.createRedisPersistence(redisClient());
})


