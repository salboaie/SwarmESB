

var reservedKeywords = {
    swarmName: 	true,
    swarmTemplate:	true,
    node:		true,
    baseUrl: true,
    port:true
}

//returns an object with the parsed variables
exports.generateTransformation = function(description, strategy){
    var context = {};

    context.node            = description.node;
    context.baseUrl         = description.baseUrl;

    context.swarmName       = description.swarmName;
    context.swarmTemplate   = description.swarmTemplate;
    context.port            = description.port;

    function prepareURL(branch, args){
        branch.path = branch.path.trim();
        var beginUrl = branch.path[0];
        if(beginUrl == '?' || beginUrl == '/'){
            beginUrl = "";
        } else {
            beginUrl = "/";
        }
        var url = context.baseUrl + beginUrl + branch.path;
        var params = {};
        for(var i = 0 ; i< args.length; i++){
            var name = branch.params[i].trim();
            if(name[0] != '$'){
                name = '$' + name;
            }
            url = url.replace(params[name], args[i]);
        }

        return url;
    }

    strategy.begin(context, description);


    for(var v in description){
        if(!reservedKeywords[v]){
            strategy.step(v, context, description[v], description)
        }
    }

    strategy.end(context, description);

    return context;
}

exports.restAPI = function(transformation, existingServer){
    return exports.generateTransformation(transformation, require("./restServer.js").newRestStrategy(undefined, existingServer));
}

exports.fs = exports.restAPI;

exports.sf = function(transformation ){
    return exports.generateTransformation(transformation, require("./sf.js").SFStrategy);
}

exports.interceptor = function(transformation, existingServer){
    return exports.generateTransformation(transformation, require("./interceptor.js").newInterceptorStrategy(existingServer));
}

exports.cs = function(transformation, existingServer){
    return exports.generateTransformation(transformation, require("./cs.js").newCSStrategy(existingServer));
}
exports.sc = function(transformation){
    console.log("SC transformation is possible but it is not implemented. You have to implement it manually using a sf transformation and a manually programmed choreography");
}

exports.createRestClient = require("./restClient.js").getRestClient;

////////////////////////////////////

