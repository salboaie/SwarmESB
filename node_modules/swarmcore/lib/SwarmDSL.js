
function CompiledSwarmRepository(){
    var compiledSwarmingDescriptions = [];

    this.compileSwarm = function (swarmName, swarmDescription, verbose) {
        dprint("Loading swarm " + swarmName);
        try {
            var obj = eval(swarmDescription);
            if (obj != null) {
                compiledSwarmingDescriptions[swarmName] = obj;
            }
            else {
                logger.hardError("Failed to load swarming description: " + swarmName);
                return false;
            }
        }
        catch (err) {
            logger.hardError("Syntax error in swarm description: " + swarmName + "\n" , err);
            return false;
        }
        return true;
    }

    CompiledSwarmRepository.prototype.getSwarmDescription = function(name){
        return compiledSwarmingDescriptions[name];
    }

    CompiledSwarmRepository.prototype.swarmExist = function(name){
        return compiledSwarmingDescriptions[name] != undefined;
    }
}

exports.repository          = new CompiledSwarmRepository();

exports.swarmExist  = CompiledSwarmRepository.prototype.swarmExist;

exports.handleErrors = function(swarm){
        //check what can be done on these cases...
        if(swarm.meta.honeyRequest){
            return false;
        }
        /* let code blocks execute fast and free of error checkings
        if(swarm.meta.transactionId){
            return true;
        }*/

        if(swarm.meta.currentPhase){
            var desc = CompiledSwarmRepository.prototype.getSwarmDescription(swarm.meta.swarmingName);
            var phaseDesc = desc[swarm.meta.currentPhase];

            if(phaseDesc && (phaseDesc.do || phaseDesc.transaction)){
                return true;
            }
        }
        return false;
    }


exports.blockExist = function (swarm, block){
    try{
        var desc = CompiledSwarmRepository.prototype.getSwarmDescription(swarm.meta.swarmingName);
        var phaseFunction = desc[swarm.meta.currentPhase][block];
        return phaseFunction != undefined;
    } catch(err){
        //ignore on purpose..returns false
    }
    return false;
}


exports.getSwarmDescription = CompiledSwarmRepository.prototype.getSwarmDescription;


