/**
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 */

/**
 *  demonstrate how to use out tenant aware redis API
 *  demonstrate how to create a chat with swarms
 */

var api = require("../api/redis.js");
thisAdapter = require('swarmutil').createAdapter("ChatServices",null,null,false);

var redisContext = api.newRedisContext(thisAdapter.redisPort,thisAdapter.redisHost,"ChatService");


saveChatMessage = function(roomId,userId,date,message){
    var json ={"roomId":roomId,"userId":userId,"date":date,"message":message};
    redisContext.lpush(roomId+"/room",JSON.stringify(json));
}

getPage = function(roomId, start, end,callBack) {
    redisContext.lrange(roomId+"/room",start,end,callBack);
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