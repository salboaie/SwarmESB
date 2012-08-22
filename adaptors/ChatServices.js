/**
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 */

var api = require("../api/redis.js");
thisAdapter = require('swarmutil').createAdapter("ChatServices");

var redisContext = api.newRedisContext(thisAdapter.redisPort,thisAdapter.redisHost,"ChatService");


saveChatMessage = function(roomId,userId,date,message){
    var json ={"roomId":roomId,"userId":userId,"date":date,"message":message};
    redisContext.lpush(roomId,JSON.stringify(json));
}

getPage = function(roomId, pageNumber, pageLines,callBack) {
    redisContext.lrange(roomId,pageNumber*pageLines,(pageNumber+1)*pageLines,callBack);
}

follow = function (resourceId,userId){
    redisContext.sadd(resourceId,userId);
}

unfollow = function (resourceId, userId){
    redisContext.srem(resourceId, userId);
}

getFollowers = function (resurceId,succesCallBack){
    redisContext.smembers(resurceId,succesCallBack);
}

cleanRoom = function (resurceId){
    redisContext.del(resurceId);
}

cleanFollowers = function (resurceId){
    redisContext.del(resurceId);
}