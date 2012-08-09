
var redis = require("redis");




exports.getRedisContext = function(redisPort,redisHost,context){
    var ctxt = new RedisContext(context);
    ctxt.client = redis.createClient(redisPort,redisHost);

    return ctxt;
}

function RedisContext(context){
    this.context = context;
}


function defaultFail(err){
    logErr("Redis command failed", err);
}

//add here all redis commands that have an key as their first argument and should get "contextualised"
var commands = ["append","set","get","incr","smembers","srem","sadd",];
var cmd;
for(var i=0;i<=commands.length){
    cmd = commands[i];
    redisContext.prototype[cmd] = function(){
        var args = []; // empty array
        for(var i = 0; i < arguments.length-2; i++){
            args.push(arguments[i]);
        }

        //each tenant has its own visibility space so keys get prefixed with tenant and context
        args[0] = this.createTenantURI(args[0]);
        var successFunction  = arguments[arguments.length-2];
        var failFunction     = arguments[arguments.length-1];
        if(failFunction == undefined){
            failFunction = defaultFail;
        }

        args.push(function (err, response){
            if(err != null){
                failFunction(err);
            }
            else{
                successFunction(response);
            });
        }
        this.client.send_command(cmd,args);
    }
}

RedisContext.prototype.createTenantURI =  function (resourceId) {
    return getCurrentTenant() + "::"+ this.context +"/"+ resId;
}



