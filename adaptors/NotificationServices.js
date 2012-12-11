thisAdapter      = require('swarmutil').createAdapter("NotificationServices",null,null,false);
var redisContext = require("../api/redis.js").newRedisContext(thisAdapter.redisPort,thisAdapter.redisHost,"NotificationServices");

saveChatMessage = function(roomId,userId,date,message){
    var json ={"roomId":roomId,"userId":userId,"date":date,"message":message};
    redisContext.lpush(roomId+"/room",JSON.stringify(json));
}

getPage = function(roomId, pageNumber, pageLines,callBack) {
    redisContext.lrange(roomId+"/room",pageNumber*pageLines,(pageNumber+1)*pageLines,callBack);
}

follow = function (resourceId,userId){
    redisContext.sadd(resourceId+"/followers",userId);
}

unfollow = function (resourceId, userId){
    redisContext.srem(resourceId+"/followers", userId);
}

getFollowers = function (resurceId,succesCallBack){
    redisContext.smembers(resurceId+"/followers",succesCallBack);
}

cleanRoom = function (resurceId){
    redisContext.del(resurceId+"/room");
}

cleanFollowers = function (resurceId){
    redisContext.del(resurceId+"/followers");
}