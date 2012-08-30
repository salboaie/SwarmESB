
var redis = require("redis");

exports.newRedisContext = function(redisPort,redisHost,context){
    var ctxt = new RedisContext(context);
    ctxt.client = redis.createClient(redisPort,redisHost);

    return ctxt;
}

function RedisContext(context){
    this.context = context;
}



//add here all redis commands that have an key as their first argument and should get "contextualised"
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
        var args = []; // empty array
        for(var i = 0; i < arguments.length; i++){
            args.push(arguments[i]);
        }

        //each tenant has its own visibility space so keys get prefixed with tenant and context
        args[0] = this.createTenantURI(args[0]);
        var successFunction = null;
        var failFunction    = null;

        if(arguments.length >= 2){
            successFunction = arguments[arguments.length-2];
            failFunction    = arguments[arguments.length-1];
        }else{
            if(arguments.length == 1){
                successFunction = arguments[0];
                failFunction    = null;
            }
        }

        if(typeof failFunction !== 'function'){
            failFunction = function(err){
                logErr("Redis command failed: " + command + J(args), err);
            }
            if(arguments.length != 1){
                successFunction = null;
            } else{
                if(typeof successFunction !== 'function'){
                    successFunction = null;
                }
            }
        }else{
            if(typeof successFunction !== 'function'){
                successFunction =  failFunction;
                failFunction = function(err){
                    logErr("Redis command failed: " + command + J(args), err);
                }
                args.pop();
            }
            else{
                args.pop();
                args.pop();
            }
        }

        args.push(function (err, response){
            dprint("Redis RESPONSE to " + command + ":" + J(response));
            if(err != null){
                failFunction(err);
            }
            else{
                if(successFunction != null){
                    successFunction(response);
                }

            }
        });
        dprint("Redis: " + command + J(args));
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
    return getCurrentTenant() + ":"+ this.context +"/"+ resourceId;
}



