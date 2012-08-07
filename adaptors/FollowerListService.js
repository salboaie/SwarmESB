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
var debug = true;

function getFSUri(resId){
    return "FollowerListService://"+resId;
}

follow = function (resourceId,userId){
    client.sadd(getFSUri(resourceId),userId);
    if(debug) {
        console.log("Follow " + resourceId + " " + userId);
    }
}

unfollow = function (resourceId, userId) {
    client.srem(getFSUri(resourceId), userId);
    if(debug) {
        console.log("Unfollow " + resourceId + " " + userId);
    }
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

thisAdapter = require('swarmutil').createAdaptor("FollowerListService");
client = redis.createClient(thisAdapter.redisPort,thisAdapter.redisHost);


