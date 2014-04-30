thisAdapter      = require('swarmutil').createAdapter("VersionManager",null,null,false);
var redisContext = require("../api/redis.js").newRedisContext(thisAdapter.redisPort,thisAdapter.redisHost,"VersionManager");

updateApplicationVersion = function(applicationId,applicationVersion,tenantId,tenantVersion)
{
    var json = {"applicationId":applicationId,
                "applicationVersion":applicationVersion,
                "tenantId":tenantId,
                "tenantVersion":tenantVersion,
                "date":new Date()};

    var key = applicationId+'-'+tenantId;
    redisContext.set(key,JSON.stringify(json));

    return json;
}

getApplicationVersion = function(applicationId,tenantId,callBack)
{
    var key = applicationId+'-'+tenantId;
    redisContext.get(key,callBack);
}

subscribe = function (applicationId,tenantId,userId){
    var key = applicationId+'-'+tenantId;
    redisContext.sadd(key+"/followers",userId);
}

getFollowers = function (applicationId,tenantId,succesCallBack){
    var key = applicationId+'-'+tenantId;
    redisContext.smembers(key+"/followers",succesCallBack);
}

cleanFollowers = function (applicationId,tenantId){
    var key = applicationId+'-'+tenantId;
    redisContext.del(key+"/followers");
}

