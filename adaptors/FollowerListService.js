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

function getFSUri(resId){
    return "FollowerListService://"+resId;
}

follow = function (resurceId,userId){
    client.sadd(getFSUri(resurceId),userId);
    console.log("Follow " + resurceId + " " + userId);
}

getFollowers = function (resurceId,callback) {
    client.SMEMBERS(getFSUri(resurceId),function (err, replies){
        if(err != null){
            perror(err);
        }
        else{
            callback(replies);
        }
    });
}

process.on('message', function(m){
    thisAdaptor = require('swarmutil').createAdaptor("FollowerListService",m.redisHost, m.redisPort);
    client = redis.createClient(m.redisPort,m.redisHost);
});


