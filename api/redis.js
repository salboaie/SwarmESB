/**
 *
 * Multi tenant API for working with REDIS
 * Warning: commands that are using more than one key are not properly implemented
 *
 */

//TODO: review all commands and remove or fix them

var redis = require("redis");


exports.newRedisContext = function(redisPort,redisHost,context){
    var ctxt = new RedisContext(context);
    ctxt.client = redis.createClient(redisPort,redisHost);
    ctxt.client.retry_delay  = 2000;
    ctxt.client.max_attempts = 20;

    return ctxt;
}

function RedisContext(context){
    this.context = context;
}



//add here all redis commands that have an key as their first argument and should get "multi-tenancy"
var commands = [
    "append",    "auth",    "bgrewriteaof",    "bgsave",    "blpop",    "brpop",    "brpoplpush",    "config get",
    "config set",    "config resetstat",    "dbsize",    "debug object",    "debug segfault",    "decr",    "decrby",
    "del",    "discard",    "echo",    "exec",    "exists",    "expire",    "expireat",    "flushall",    "flushdb",
    "get",    "getbit",    "getrange",    "getset",    "hdel",    "hexists",    "hget",    "hgetall",    "hincrby",
    "hkeys",   "hlen",    "hmget",    "hmset",    "hset",    "hsetnx",    "hvals",    "incr",    "incrby",    "info",
    "keys",    "lastsave",    "lindex",    "linsert",    "llen",    "lpop",    "lpush",    "lpushx",    "lrange",
    "lrem",    "lset",    "ltrim",    "mget",    "monitor",    "move",    "mset",    "msetnx",    "multi",    "object",
    "persist",    "ping",    "psubscribe",    "publish",    "punsubscribe",    "quit",    "randomkey",    "rename",
    "renamenx",    "rpop",    "rpoplpush",    "rpush",    "rpushx",    "sadd",    "save",   "scard",    "sdiff",
    "sdiffstore",    "select",    "set",    "setbit",    "setex",    "setnx",    "setrange",    "shutdown",    "sinter",
    "sinterstore",    "sismember",    "slaveof",    "smembers",    "smove",    "sort",    "spop",    "srandmember",
    "srem",    "strlen",    "subscribe",    "sunion",    "sunionstore",    "sync",    "ttl",    "type",    "unsubscribe",
    "unwatch",    "watch",    "zadd",    "zcard",    "zcount",    "zincrby",    "zinterstore",    "zrange",
    "zrangebyscore",    "zrank",    "zrem",    "zremrangebyrank",    "zremrangebyscore",    "zrevrange",
    "zrevrangebyscore",    "zrevrank",    "zscore",    "zunionstore"
];

function createFunction(command){
    return function(){
        var args = new Array(); // empty array

        for(var i = 0; i < arguments.length; i++){
            args.push(arguments[i]);
        }

        //each tenant has its own visibility space so keys get prefixed with tenant and context
        args[0] = this.createTenantURI(args[0]);

        var failFunction    = null;
        var successFunction = null;

        if(arguments.length <= 1) {
            var failFunction    = null;
            var successFunction = null;
        } else if(arguments.length == 2) {
            var failFunction    = null;
            var successFunction = arguments[1];
            if(typeof successFunction !== 'function') {
                successFunction = null;
            } else {
                args.pop();
            }
        }
        else if(arguments.length >= 3){
            successFunction = arguments[arguments.length-2];
            failFunction    = arguments[arguments.length-1];
            if(typeof failFunction !== 'function'){
                failFunction    = null;
                successFunction = null;
            }
            else {
                if(typeof successFunction !== 'function'){
                    successFunction = failFunction;
                    args.pop();
                } else {
                    args.pop();
                    args.pop();
                }
            }
        }
        if(failFunction == null){
            failFunction = function(err){
                logErr("Redis command failed: " + command + J(args), err);
            }
        }

        args.push(function (err, response){
            //cprint("Redis RESPONSE for " + command +  J(args) + ":" + J(response));
            if(err != null){
                failFunction(err);
            }
            else{
                if(successFunction != null){
                    successFunction(response);
                }
            }
        });
        cprint("Redis command: " + command + J(args));
        this.client.send_command(command,args);
    }
}

function init(){
    for(var i=0;i<commands.length;i++) {
        var cmd = commands[i];
        RedisContext.prototype[cmd] = createFunction(cmd);
        cmd = cmd.toUpperCase();
        RedisContext.prototype[cmd] = createFunction(cmd);
    }
}

init();

RedisContext.prototype.createTenantURI =  function (resourceId) {
    var uri = getCurrentTenant() + ":"+ this.context +"/"+ resourceId;
    return uri;
}
