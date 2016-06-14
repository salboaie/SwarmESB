
/*
 Purpose: SC: service to choreography transformation.
 Status: stable
 TODOs:

 Assumes: an swarm like environment
 */



// service to choreography...
exports.newInterceptorStrategy = function(existingServer){
    return require("./restServer.js").newRestStrategy(
        function(name, context, description,args, callback){
            var swarmName           = description.swarmName;
            var adapter             = description.adapter;

            var params              = description[name].params;
            var stepDescription     = description[name];


            args.unshift(name);
            args.unshift(adapter);
            args.unshift(description);
            args.unshift("call");
            args.unshift(swarmName);

            var swarm = startSwarm.apply(null, args);
            swarm.onResult(function(err, res){
                if(err || res == false){
                    console.log("Rejecting call ", name, description);
                    return;
                }
                callback(null,res);
            });
        },
        existingServer
    );
};