var repository  = {};


//fake startSwarm
function FakeSwarm(){
    var callbacks = {};

    this.on = function(phase, callback){
        callbacks[phase] = callback;
    }

    this.onResult = function(callback){
        callbacks['*'] = callback;
    }


    this.home = function(phase, result){
        this.__result = result;
        setTimeout(function(){
            var method = callbacks[phase];
            if(method){
                method(null, result);
            } else {
                console.log("No handler listening for ", phase);
            }
        }, 50);

        if(phase != "*") {
            this.home("*", result);
        }
    }

    this.getEntity = function(entityId, token){
        this.home("get", repository[entityId]);
    }

    this.createEntity = function(token, entityId, __body){
        repository[entityId] = __body;
        this.home("put", entityId);
    }

    this.updateEntity = function(entityId, __body){
        repository[entityId] = __body;
        this.home("post", entityId);
    }

    this.deleteEntity = function(entityId, token){
        delete repository[entityId];
        this.home("delete", true);
    }


    this.call = function(){
        console.log("Call:", arguments[2]);
        var f = this[arguments[2]].bind(this);
        f(arguments[3], arguments[4], arguments[5]);
    }
}

startSwarm = function (swarmingName, ctorName) {
    var swarm = new FakeSwarm();
    var args = []; // empty array
    for (var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    var ctor = swarm[ctorName];
    if(ctor){
        swarm[ctorName].apply(swarm, args);
    } else {
        console.log("Failed to discover ctor", ctorName);
    }

    return swarm;
}