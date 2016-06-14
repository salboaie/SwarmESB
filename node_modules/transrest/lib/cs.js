/**
 * Created by salboaie on 12/18/15.
 */

/*
 Purpose: CS: choreography to service transformation
 Status: stable
 TODOs:

 Assumes: this code can exist in a swarm choreography environment with global APis like startSwarm
 */


exports.newCSStrategy = function(existingServer){
    return require("./restServer.js").newRestStrategy(
        function(name, context, description, args, callback){
            var swarmName           = description.swarmName;
            var params              = description[name].params;
            var stepDescription     = description[name];
            var resultPhase         = stepDescription.resultPhase;

            args.unshift(name);
            args.unshift(name);
            var swarm = startSwarm.apply(null, args);
            swarm.on(resultPhase, callback);
        },
        existingServer
    );
}