var jsondiffpatch = require('jsondiffpatch').create();

function SharedContext(contextId, startValues){
    if(!startValues){
        startValues = {};
    }
    this.__meta = {
        contextId      : contextId,
        initialValues  : startValues
    }
    for(var v in startValues){
        this[v] = startValues[v];
    }
    console.log("Creating context ",contextId);
}

/*
 Detect properties locally changed
 */
SharedContext.prototype.diff = function(propertyHandler) {
    var newThis = {};
    for(var v in this){
        if(v != "__meta" && typeof this[v] != "function") {
            newThis[v] = this[v];
        }
    }
    var diffLocal      = jsondiffpatch.diff(this.__meta.initialValues, newThis);
    //console.log("Diff found", diffLocal);
    for(var v in diffLocal){
            //console.log(v, this[v]);
            propertyHandler(v, this[v]);
    }
}

SharedContext.prototype.deleteProperty = function(name){
    if(this.hasOwnProperty(name) || name != "__meta"){
        delete this[name];
    }
}

SharedContext.prototype.deleteProperty = function(name){
    if(this.hasOwnProperty(name) || name != "__meta"){
        delete this[name];
    }
}

exports.newContext = function(contextId, values){
    return new SharedContext(contextId, values);
}


