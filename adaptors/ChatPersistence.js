/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 * To change this template use File | Settings | File Templates.
 */
var thisAdaptor;
var redis = require("redis");
var client;

function saveChatMessage(roomId,userId,date,message){
    var jso={"roomId":roomId,"userId":userId,"date":date,"message":message};
    client.lpush(roomId,JSON.stringify(jso));
}

function getPage(roomId, pageNumber, pageLines,callBack) {
    client.lrange(roomId,pageNumber*pageLines,(pageNumber+1)*pageLines,function (err, replies){
            callBack(replies);
        }
    );
}

process.on('message', function(m){
    thisAdaptor = require('./Adaptor.js').init("ChatPersistence",m.redisHost, m.redisPort);
    client = redis.createClient(m.redisPort,m.redisHost);
    thisAdaptor.loadSwarmingCode();
    thisAdaptor.addAPIFunction("saveChatMessage", saveChatMessage);
    thisAdaptor.addAPIFunction("getPage", getPage);
});


