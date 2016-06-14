
var redis = require("redis");

var uuid = require('node-uuid');
var util = require("util");
var RELAY_PUBSUB_CHANNEL_NAME = "PubSubRelay";

var CONFIGURATION_REQUEST_CHANNEL_NAME = "PubSub_CONFIGURATION_CHANNEL_REQUEST";
var CONFIGURATION_ANSWEAR_CHANNEL_NAME = "PubSub_CONFIGURATION_CHANNEL_ANSWEAR";

var container = require("safebox").container;

/*
    TODO: review error handling code! Still not cool enough...
*/


function NotReadyAPI(realCallback, setter){
    var pendingCommands = [];
    var self = this;
    function fakeCallback(){
        var args = [];
        for(var i= 0,len= arguments.length; i<len;i++){
            args.push(arguments[i]);
        }
        pendingCommands.push(args);
    }


    this.activate = function(){
        setter(realCallback);
        pendingCommands.forEach(function(args){
            realCallback.apply(self, args);
        })
        pendingCommands = [];
    }

    setter(fakeCallback);

}


function RedisPubSubClient(redisPort, redisHost , redisPassword, statusReporting){

    console.log("Connecting to:", redisPort, redisHost);
    var cmdRedisClient = null;
    var subscribeRedisClient = redis.createClient(redisPort, redisHost, redisPassword);
    var self = this;
    subscribeRedisClient.retry_delay = 1000;
    subscribeRedisClient.max_attempts = 100;
    subscribeRedisClient.on("error", onRedisReconnecting);

    subscribeRedisClient.on("ready", function(){
            cmdRedisClient = redis.createClient(redisPort, redisHost, redisPassword);
            cmdRedisClient.retry_delay = 2000;
            cmdRedisClient.max_attempts = 20;
            cmdRedisClient.on("error", onRedisReconnecting);
            cmdRedisClient.on("reconnecting", onRedisReconnecting);
            cmdRedisClient.on("ready",onRedisReconnecting);
        });


    var listeners = {};


    this.subscribe = function(channel, callback){
        listeners[channel] =  callback;
        subscribeRedisClient.subscribe(channel);
    }

    subscribeRedisClient.on("message", function(channel, res){
        var c = listeners[channel];
        var obj;
        if(c){
            try{
                obj = JSON.parse(res);
            } catch(err){
                console.log("Non JSON object received from Redis!", res, channel);
            }
            if(!obj){
                throw new Error("Wrong message from " + channel + "Got:" +  util.inspect(res));
            }
            c(obj, channel);
        }
    })

    this.publishImpl  = function(channel, message, callback){
        //console.log("Callback is:", callback);
        if(callback){
            cmdRedisClient.publish(channel, message, callback);
        } else {
            cmdRedisClient.publish(channel, message, undefined);
        }
    }


    this.publish = this.publishImpl;

    this.getCmdConnection = function(){
        return cmdRedisClient;
    }

    function onRedisReconnecting(err, res) {
        if(!err){
            if(cmdRedisClient.retry_delay < 30000){
                cmdRedisClient.retry_delay += 1000;
            }
        }
        statusReporting(err, cmdRedisClient);
        //localLog("redis", "Redis reconnecting attempt [" + event.attempt + "] with delay [" + event.delay + "] !", event);
    }

}


var busNode = require("./BusNode.js");

exports.createRelay = function(httpsEnabled,organisationName, redisHost, redisPort, redisPassword, publicHost, publicPort, keySpath, filesPath, statusReporting){

  var redis = new RedisPubSubClient(redisPort, redisHost, redisPassword, function(err){
     if(err){
         statusReporting(err);
     }
  });

    function relayImpl(){
        this.doDispatch = function(redis, channel, message, callback){
            redis.publish(channel, message, callback);
        }
        this.dispatch = function (channel, message, callback){
            this.doDispatch(redis, channel, message, callback);
        }
    }

    var relay =  new relayImpl();
    if(httpsEnabled){
        relay.server = busNode.createHttpsNode(publicPort, keySpath, filesPath, relay);
    }

    redis.subscribe(RELAY_PUBSUB_CHANNEL_NAME, function(envelope){
        busNode.pushMessage(keySpath, envelope.organisation, envelope.localChannel, envelope.message);
    })

    redis.subscribe(CONFIGURATION_REQUEST_CHANNEL_NAME, function(){
        if(organisationName){
            redis.publish(CONFIGURATION_ANSWEAR_CHANNEL_NAME, JSON.stringify({publicHost:publicHost, publicPort:publicPort, organisationName:organisationName}));
        } else {
            console.log("Organisation name requested but not available!");
        }
    })
    statusReporting(null, relay);
    return relay;
}



/*
 statusReporting will be called with errors or with a valid redis connection that can be used to send Redis Commands

 */

exports.createClient = function(redisHost, redisPort, redisPassword, keysFolder, statusReporting){

    var publicFSHost;
    var publicFSPort;
    var organisationName;

    function askConfig(){
        console.log("Publishing config request...");
        client.publish(CONFIGURATION_REQUEST_CHANNEL_NAME, JSON.stringify({ask:"config"}), function(){});
    }

    var client = new RedisPubSubClient(redisPort, redisHost, redisPassword,  function(err, cmdConnection){
        if(!err){
            publishPending.activate();
            askConfig();
            client.subscribe(CONFIGURATION_ANSWEAR_CHANNEL_NAME, function(obj){
                //WELL.. check also what happens after many reconnects...
                publicFSHost = obj.publicHost;
                publicFSPort = obj.publicPort;
                if(organisationName != obj.organisationName) {
                    organisationName = obj.organisationName;
                    console.log("Current organisation is: ", organisationName );
                }
            })
        }
        if(!err && cmdConnection == null) throw(new Error("Redis connection can't be null!"));
        statusReporting(err, cmdConnection);
    });


    var publishPending   =  new NotReadyAPI(publish,function(callback){
        client.publish = callback;
    })


    function copyFile(source, target, callback) {
            function reject(err){
                callback(err)
            }
            var rd = fs.createReadStream(source);
            rd.on('error', reject);
            var wr = fs.createWriteStream(target);
            wr.on('error', reject);
            wr.on('finish', callback);
            rd.pipe(wr);
    }


    function publish(channel, message, callback){
        var strMessage;
        if(typeof message == "string"){
            strMessage = message;
        } else {
            strMessage = JSON.stringify(message);
        }


        var res = channel.match(/\s*!([\w\.]+[:]*\d*)\/(.*)/);
        if(res){
                var envelope = {
                    localChannel:res[2],
                    organisation:res[1],
                    message:strMessage
                }
            client.publishImpl(RELAY_PUBSUB_CHANNEL_NAME, JSON.stringify(envelope), callback);
            } else {
            client.publishImpl(channel, strMessage, callback);
        }
    }

    function shareFile(filePath, callback){
        var uid = new Buffer(JSON.stringify({organisation:organisationName, random:uuid.v4()})).toString('base64');
        busNode.upload(keysFolder, organisationName, uid, filePath, function(err, res){
            callback(err, uid);
        });
    }

    function download(transferId, path, callback){
        var js = JSON.parse(new Buffer(transferId, 'base64').toString('ascii'));
        busNode.download(keysFolder, transferId, js.organisation,  path, callback);
    }

    var shareFileApi    =  new NotReadyAPI(shareFile,function(callback){
        client.shareFile = callback;
    })

    var downloadFileApi = new NotReadyAPI(download,function(callback){
        client.download = callback;
    })


    client.unshare = function(transferId, callback){
        var js = JSON.parse(new Buffer(transferId, 'base64').toString('ascii'));
        busNode.unshare(keysFolder, transferId, js.organisation, callback);
    }

    var timeOut = 200;

    function checkIfWeGotConfiguration(){
        if(!publicFSHost){
            console.log("Requesting current organisation name from:", redisHost, redisPort);
            askConfig();
            setTimeout(checkIfWeGotConfiguration, timeOut);
            timeOut += 1000;
        } else {
            console.log("Activating file bus components...");
            shareFileApi.activate();
            downloadFileApi.activate();
        }
    }

    checkIfWeGotConfiguration();

    return client;
}