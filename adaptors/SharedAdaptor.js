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

function getUri(contextId,key){
    return "shared://"+contextId+"/"+key;
}

/*
lpush = function(contextId,key,value){
    client.lpush(getUri(contextId,key),value);
}


incr = function(contextId,key){
    client.incr(getUri(contextId,key));
}

incrby = function(contextId,key,value){
    client.incrby(getUri(contextId,key,value));
}

decr = function(contextId,key){
    client.decr(getUri(contextId,key));
}

get = function(contextId,key){
    client.get(getUri(contextId,key));
}

set = function(contextId,key){
    client.set(getUri(contextId,key));
}        */


/*
var transientContext={};

incr = function(contextId,key){
    var vn = getUri(contextId,key);
    if(transientContext[vn] == undefined){
        transientContext[vn] = 0;
    }
    transientContext[vn]++;
}

get = function(contextId,key){
    return transientContext[getUri(contextId,key)];
}

set = function(contextId,key,value){
    transientContext[getUri(contextId,key)] = value;
}

*/

thisAdaptor = require('swarmutil').createAdaptor("SharedAdaptor");
//client = redis.createClient(thisAdaptor.redisPort,thisAdaptor.redisHost);



