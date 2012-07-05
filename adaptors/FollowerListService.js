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

function follow(resurceId,userId){
    client.lpush(resurceId,userId);
}

function getFollowers(resurceId,callback) {
    client.lrange(resurceId,0,100,function (err, replies){
            callBack(replies);
        }
    );
}

process.on('message', function(m){
    thisAdaptor = require('swarmutil').createAdaptor("FollowerListService",m.redisHost, m.redisPort);
    client = redis.createClient(m.redisPort,m.redisHost);
});


