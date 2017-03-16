/*
    asynchron: trying a better syntax for promises...
 */


var Q = require("q");

if(typeof singleton_asyncron_module_workaround_for_wired_node_js_caching == 'undefined') {
    singleton_asyncron_module_workaround_for_wired_node_js_caching = module;
} else {
    module.exports = singleton_asyncron_module_workaround_for_wired_node_js_caching.exports;
    return;
}


exports.Q = Q;


function mkArgs(myArguments, from , promises, positions){
    if(myArguments.length <= from){
        return [];
    }
    var args = [];
    for(var i = from; i<myArguments.length;i++){
        args.push(myArguments[i]);
    }

    for(var i = 0; i < args.length ; i++){
        if(Q.isPromise(args[i])){
            promises.push(args[i]);
            positions.push(i);
        }
    }

    return args;
}

function errorLogger(error, promises){
    if(typeof asynchron_logError == "undefined"){
        console.log("Debug error:", error, error.stack, new Error().stack);
        if (promises) {
            console.log(" Q.all .. error in one of the following promises stacks:");
            for(var i = 0 , len = promises.length; i< len; i++){
                if(promises[i].stack){
                    console.log(promises[i].stack, "\n")
                } else {
                    console.log("Unknown stack", "\n")
                }
            }
            console.log(" If still doesn't make sense, check for callback calls that are not properly promisified or mistakes like cb(result) instead of cb(err, result)");
        }
    } else {
        asynchron_logError(error, promises);
    }
}



Q.longStackSupport = true; //enable in your code, only for desperate times ;)

function getWaitFunction(contextCallBack, debugString){
    return function(){
        var promises  = [];
        var positions = [];
        var args = mkArgs(arguments, 0, promises, positions );

        var errorFunction = null;
        if(typeof args[args.length - 1] == "function"){
            errorFunction = args[args.length -1];
        }

        /*if(promises.length ==0){
            errorLogger(new Error("wait functions require promises not solved arguments"));
        }*/
        var callBack = this;
        function _endCall(withError, values){
            if(withError){
                if(errorFunction){
                    errorFunction(withError);
                } else {
                    errorLogger(withError);
                }
            } else {
                callItFinally(values);
            }
        }

        var endCall;

        if(contextCallBack){
            endCall = contextCallBack(_endCall);
        } else {
            endCall =  _endCall;
        }


        function callItFinally(values){
            for(var i=0; i < positions.length; i++){
                args[positions[i]] = values[i];
            }
            try{
                callBack.apply(null,args);
            } catch(error){
                if(errorFunction){
                    errorFunction(error);
                } else {
                    errorLogger(error);
                }
            }
        }

        if(promises.length == 0){
            endCall(false, args);
        } else {
            Q.all(promises)
                .then( function (results) {
                        endCall(null, results);
                    },
                    function (error) {
                        endCall(error);
                    }
                ).done();
        }
    };
}

Function.prototype.wait = getWaitFunction();

exports.createSwait = function(){
    if(typeof createSwarmCallback != "undefined"){
        Function.prototype.swait = getWaitFunction(createSwarmCallback);
    } else {
        console.log("createSwait got wrongly called outside swarm environment...");
    }
}


function asyncCreator(errorConverter, wantFails, haveTimeout, json){
    var startArgs = 0
    if(haveTimeout){
        startArgs = 1;
    }
    return  function (){
        var promises  = [];
        var positions = [];
        var args = mkArgs(arguments, startArgs,  promises, positions );
        var callBack = this;
        var deferred = Q.defer();

        function callItFinally(values){
            for(var i=0; i < positions.length; i++){
                args[positions[i]] = values[i];
            }

            args.push(function (error, value) {
                if (error) {
                        errorConverter(deferred,error);
                } else {
                    if(json){
                        try{
                            //console.log("Value:",value, "!");
                            var res = JSON.parse(value);
                            value = res;
                        } catch(err){
                            console.log("Bad json format resulted for jasync call!", value);
                            errorLogger(err);
                        }
                    }
                    deferred.resolve(value);
                }
            });

            try{
                callBack.apply(null,args);
            } catch(error){
                    errorLogger(error);
                throw err;
            }
        }

        if(promises.length ==0){
            callItFinally();
            return deferred.promise;
        } else {
                if(wantFails){
                    Q.allSettled(promises).then(function(results){
                        for(var i = 0; i < results.length ; i++ ){
                            if(results[i].state !== "fulfilled"){
                                    //console.log(results[i]);
                                    return callBack.apply(null,[results[i].reason]);
                                    //deferred.reject(results[i].reason);
                            }
                        }
                    }).done();
                }  else {
                    Q.all(promises)
                        .then(function (results) {
                                callItFinally(results);
                            },
                            function (error) {
                                    errorConverter(deferred,error);

                            }
                    ).done();
                }
        }

        if(haveTimeout){
          var timeOut = arguments[0];
            return deferred.promise.timeout(timeOut)
        }
        return deferred.promise;
    }
}

Function.prototype.nasync  =  asyncCreator(function(deferred, error){
                                            deferred.resolve(null);
                                        }
                             );

Function.prototype.async  =  asyncCreator(function(deferred, error){
                                            deferred.reject(error);
                                        }
                              );

Function.prototype.jasync  =  asyncCreator(function(deferred, error){
        deferred.reject(error);
    },false,false,true
);

Function.prototype.fail  =  asyncCreator(function(deferred, error){
                                            deferred.reject(error);
                                        },
                                        true
                            );


Function.prototype.timeout  =  asyncCreator(function(deferred, error){
                                            deferred.reject(error);
                                        },
                                        true, true
                                 );

exports.bindAllMembers = function(object){
    for(var property in object){
        if(typeof object[property] == 'function'){
            object[property] = object[property].bind(object);
        }
    }
    return object;
}
