var RateLimiter = require('limiter2').RateLimiter;
var throttlerConfig = {
    limit:100000,
    timeUnit:"minutes"
};

loadThrottlerConfig(throttlerConfig, thisAdapter.mainGroup,"startSwarmThrottler");
var limiter = new RateLimiter(throttlerConfig.limit, throttlerConfig.timeUnit);


exports.accept = function( callBack){
    if(limiter.accept(1)){
        callBack();
    } else {
        logger.logError("New startSwarm failed because of throttling");
        throw new Error("Throttling limit reached");
    }
}

exports.resetThrottler = function(limit, timeUnit){
    throttlerConfig.limit = limit;
    throttlerConfig.timeUnit = timeUnit;
    limiter = new RateLimiter(limit, timeUnit);
}
