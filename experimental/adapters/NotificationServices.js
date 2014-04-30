thisAdapter      = require('swarmutil').createAdapter("NotificationServices",null,null,false);
var redisContext = require("../api/redis.js").newRedisContext(thisAdapter.redisPort,thisAdapter.redisHost,"NotificationServices");

saveChatMessage = function(roomId,userId,date,message,objectId){
    var json ={"roomId":roomId,"userId":userId,"date":date,"message":message,"objectId":objectId};
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

deleteMessageById = function (roomId,objectId){
    var result = function(res)
    {
        var i,message;
        for ( i=0; i<res.length; i++)
        {
            message = JSON.parse(res[i]);
            if ( message.objectId === objectId )
            {
                redisContext.lrem(roomId+"/room",0,res[i],function(res){
                    var a= res;
                });
            }
        }
    }
    getPage(roomId,0,100,createSwarmCallback(result));
}

