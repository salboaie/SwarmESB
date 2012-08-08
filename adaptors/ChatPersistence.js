/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 * To change this template use File | Settings | File Templates.
 */
var redis = require("redis");
var client;

function getRoomUri(roomId){
    return "ChatPersistence://"+roomId;
}

saveChatMessage = function(roomId,userId,date,message){
    var jso={"roomId":roomId,"userId":userId,"date":date,"message":message};
    client.lpush(getRoomUri(roomId),JSON.stringify(jso));
}


getPage = function(roomId, pageNumber, pageLines,callBack) {
    client.lrange(getRoomUri(roomId),pageNumber*pageLines,(pageNumber+1)*pageLines,function (err, replies){
            callBack(replies);
        }
    );
}

thisAdapter = require('swarmutil').createAdapter("ChatPersistence");
client = redis.createClient(thisAdapter.redisPort,thisAdapter.redisHost);


