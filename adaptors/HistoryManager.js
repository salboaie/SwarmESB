thisAdapter = require('swarmutil').createAdapter("HistoryManager", null, null, false);
var redisContext = require("../api/redis.js").newRedisContext(thisAdapter.redisPort, thisAdapter.redisHost, "HistoryManager");

saveChatMessage = function (roomId, userId, date, message, objectId) {
    var json = {"roomId": roomId, "userId": userId, "date": date, "message": message, "objectId": objectId};
    redisContext.lpush(roomId + "/room", JSON.stringify(json));
}

getPage = function (roomId, start, end, callBack) {
    redisContext.lrange(roomId + "/room", start, end, callBack);
}
follow = function (resourceId, userId) {
    redisContext.sadd(resourceId + "/followers", userId);
}

unfollow = function (resourceId, userId) {
    redisContext.srem(resourceId + "/followers", userId);
}

getFollowers = function (resurceId, succesCallBack) {
    redisContext.smembers(resurceId + "/followers", succesCallBack);
}

cleanRoom = function (resurceId) {
    redisContext.del(resurceId + "/room");
}

cleanFollowers = function (resurceId) {
    redisContext.del(resurceId + "/followers");
}

adapterStateCheck = function (data) {
   // return {ok: false, requireRestart: true, details: 'want to restart me'};
    return {ok: true};
}