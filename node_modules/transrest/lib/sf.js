/**
 * Created by salboaie on 12/18/15.
 */


/*
////////////////////////////////////
 This strategy takes a transformation description -> set of functions that can be exposed in a SwarmESB adapter

////////////////////////////////////
*/


/*
 Purpose: SF: service to functions transformation. It can be used to create adapters for SwarmESB using external REST APIs
 Status: stable
 TODOs: extend the APi to make it more friendly with SwarmESB adapters

 Assumes: nothing
 */

var client = require("./restClient.js").getRestClient();



function bindPath(args, name, stepDescription, description){
    var path = stepDescription['path'];

    if(!path){
        console.log("path attribute in ", name, " A type transformation description is mandatory");
        return "invalid";
    }
    var params = stepDescription.params;

    if(!(params instanceof Array)){
        console.log("params attribute in ", name, " transformation description should be an array with names");
        return "invalid";
    }

    if((params.length + 1)  != args.length){
        console.log("Calling ", name, " transformed API, requires ", params.length+1 , " arguments");
        return "invalid";
    }

    try{
        for(var i = 0; i < args.length && i < params.length; i++){
            path = path.replace("$"+params[i], args[i]);
        }
    }catch(err){
        console.log(err);
    }
    var fullPath = description.baseUrl + path;
    return fullPath;
}


function extractBody(args, name, stepDescription){
    var method = stepDescription.method.trim().toLowerCase();
    var haveBody = false;

    if(method == "post" || method == "put"){
        haveBody = true;
    } else {
        return null;
    }

    var params = stepDescription.params;
    for(var i = 0; i < args.length; i++ ){
        if(params[i] == "__body"){
            return args[i];
        }
    }

    console.log("An argument named __body is mandatory for transformed API from GET and POST", name);
}

function extractCallback(args, name){
    var c  = args[args.length -1];
    if(typeof c != 'function'){
        console.log("Error with ", name, ' API call. The last argument in all the transformed APIs should be a function')
        return null;
    }
    return c;
}

exports.SFStrategy = {
    begin:function(context, description){

    },
    step:function(name, context, stepDescription, description){
        context[name] = function(){
            var method = stepDescription.method.trim();
            var callback = extractCallback(arguments, name, stepDescription);
            var body = extractBody(arguments, name, stepDescription);
            var url = bindPath(arguments, name, stepDescription, description);
            client.request(method, url, body, callback);
        };
    },
    end:function(context, description){

    }
}

