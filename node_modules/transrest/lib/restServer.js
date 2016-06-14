/**
 * Created by salboaie on 12/23/15.
 */
/**
 * Created by salboaie on 12/18/15.
 */

var http = require("http");
var connect = require("connect");
var connectRoute = require('connect-route');
var parser = require("./parsePath.js");



function RestStrategy(codeExecutionStrategy, existingHttpServer, generalContext){
    console.log("Existing server: ",existingHttpServer);
    var self = this;

    function retriveContent(req, callback){
        var bodyStr = "";
        req.on("data",function(chunk){
            bodyStr += chunk.toString();
        });
        req.on("end",function(){
            callback(null, bodyStr);
        });
    }



    function callCode(name, context, description, callback){

        var stepDescription = description[name];

        function makeArgs(){
            var p = stepDescription.params;
            var args = [];
            for(var i=0; i < p.length; i++ ){
                args.push(context[p[i]]);
            }
            return args;
        }

        var result = null;


        var args = makeArgs(context, stepDescription);
        if(codeExecutionStrategy){
            result = codeExecutionStrategy(name, context, description, args, callback);
        } else {
            try{
                var result = stepDescription.code.apply(context, args);
                if(!result){
                    result = 'undefined';
                }
            }catch(err){
                console.log("Error executing code in step ",name," : ", err);
                result = 'error';
            }

            callback(null,result.toString());
        }
    }


        this.begin = function(context, description){
            if(!existingHttpServer){
                console.log("Creating http server...");
                context.server = connect();
                context.server.listen(context.port);
            } else {
                context.server = existingHttpServer;
            }


            self.description = description;

            context.server.use(function (request, response, next) {
                console.log("New " + request.method + " request for:",request.url);
                next();
            });

            context.getRoutes = {};
            context.putRoutes = {};
            context.postRoutes = {};
            context.deleteRoutes = {};

        }


        function  getEndCall(res, next){
            return function(err, result){
                var buf = "";
                if(err){
                    buf = err.toString();
                } else {
                    if(result) {
                        buf = result.toString();
                    } else {
                        buf = "undefined";
                    }
                }
                res.write(buf);
                res.end();
                next();
            }
        }

        this.step = function(name, context, stepDescription){

            if(!stepDescription.path){
                //console.log("Path should be defined for ", name, stepDescription);
                return ;
            }

            var route = stepDescription.path.replace(/\$/g, ":");

            function getDoGet(){
                return function(req, res, next){
                    var context = parser.parsePath(req.url, stepDescription.path);
                    callCode(name, context, self.description, getEndCall(res, next));
                }
            }

            function getDoPut(){
                return function(req, res, next){
                    retriveContent(req, function(err, result){
                        var context = parser.parsePath(req.url, stepDescription.path);
                        context.__body = result;
                        callCode(name, context, self.description, getEndCall(res, next));
                    })
                }
            }

            function getDoPost(){
                return function(req, res, next){
                    retriveContent(req, function(err, result){
                        var context = parser.parsePath(req.url, stepDescription.path);
                        context.__body = result;
                        callCode(name, context, self.description, getEndCall(res, next));
                    })
                }
            }

            function getDoDelete(){
                return function(req, res, next){
                    var context = parser.parsePath(req.url, stepDescription.path);
                    callCode(name, context, self.description, getEndCall(res, next));
                }
            }

            switch(stepDescription.method.trim().toLowerCase()){
                case 'get'      : context.getRoutes[route]    = getDoGet();    break;
                case 'put'      : context.putRoutes[route]    = getDoPut();    break;
                case 'post'     : context.postRoutes[route]   = getDoPost();   break;
                case 'delete'   : context.deleteRoutes[route] = getDoDelete(); break;
                default         : console.log("Invalid/unsupported method ", stepDescription.method);
            }
        }


        this.end = function(context, description){
            context.server.use(connectRoute(function(router){
                for(var v in context.getRoutes){
                    console.log("Adding GET route ", v);
                    router.get(v, context.getRoutes[v]);
                }

                for(var v in context.putRoutes){
                    console.log("Adding PUT route ", v);
                    router.put(v, context.putRoutes[v]);
                }

                for(var v in context.postRoutes){
                    console.log("Adding POST route ", v);
                    router.post(v, context.postRoutes[v]);
                }

                for(var v in context.deleteRoutes){
                    console.log("Adding DELETE route ", v);
                    router.delete(v, context.deleteRoutes[v]);
                }
            }))
        }
}



exports.newRestStrategy  = function( stepFunction, existingHttpServer){
    return new RestStrategy(stepFunction, existingHttpServer);
}