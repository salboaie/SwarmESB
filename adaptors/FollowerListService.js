/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 * To change this template use File | Settings | File Templates.
 */

var redis = require("redis");
var client;
var debug = true;


follow = function (resourceId,userId){

}



/*
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
            logErr(err);
        }
        else{
            callback(replies);
        }
    });
}
*/

require('swarmutil').createAdapter("FollowerListService");
client = redis.createClient(thisAdapter.redisPort,thisAdapter.redisHost);


