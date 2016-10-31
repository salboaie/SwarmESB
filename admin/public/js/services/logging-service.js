/**
 * Created by ciprian on 4/18/16.
 */
angular.module('app')
    .service("loggingService", function () {


        var enabled = false;

        var logs = {};
        var logsListeners = {};
        var olderLogsRequesters = {};
        var logsChunk = 30;
        var typeListeners = [];

        function startLogger() {
            swarmHub.startSwarm("Logger.js", "start",30);

            swarmHub.on("LogsFetcher.js", "getLogLevels", function (swarm) {
                for(var type in swarm.levels){
                    if(!logs[type]){
                        logs[type] = [];
                    }
                    if(!olderLogsRequesters[type]){
                        olderLogsRequesters[type] = [];
                    }

                    addLogLevel(type);
                }
            })


            swarmHub.on("LogsFetcher.js", "gotNewLog", function (swarm) {
                var type = swarm['log']['type'];

                if(!logs[type]){
                    logs[type] = [swarm['log']];
                }else{
                    logs[type].unshift(swarm['log']);
                }


                for (var observer in logsListeners) {
                    logsListeners[observer](swarm['log']);
                }
            })


            function processLog(log){

                log.whyTree = buildWhyTree(log);
                log.displayStack = processStack(log);
                function processStack(log){
                    var displayStack;
                    if(log.stack) {
                        displayStack = log.stack.split(" at ").map(function (stackLine) {
                            return stackLine.trim();
                        })
                        displayStack.shift();
                    }
                    return displayStack;
                }

                function buildWhyTree(log){
                    if(log.whyLog) {
                        return log.whyLog.map(function (log) {
                            for (var n in log) {
                                name = n;
                            }
                            return extractNode(name, log[name]);
                        })
                    }
                    else{
                        return [];
                    }

                    function extractNode(name,info){

                        var node = {
                            'label':name,
                            'description':extractDescription(info)
                        };

                        if(info.calls){
                            node.children = [];
                            for(var child in info.calls){
                                node.children.push(extractNode(child,info.calls[child]));
                            }
                        }
                        return node;

                        function extractDescription(info){
                            var description = {};
                            if(info.args.length!==0){
                                var arg = "";
                                info.args.forEach(function(a){
                                    arg+=a+" ";
                                })
                                description['arguments'] = "Arguments:"+arg;
                            }
                            if(info.stack.length!==0){
                                description.stack = info.stack.map(function(stackLine){
                                    var l = stackLine.split(" at ");
                                    l = l[l.length-1].trim();
                                    return l;
                                })
                            }
                            return description;
                        }
                    }
                }
            }

            var timeout = 100;
            swarmHub.on("LogsFetcher.js","gotOlderLogs",function(swarm){
                var requesters = olderLogsRequesters[swarm['type']];

                if(logs[swarm.type]===undefined){
                    logs[swarm.type] = [];
                }

                swarm.logs.forEach(function(log){
                    logs[swarm.type].push(log);
                    processLog(log);
                    requesters.forEach(function (requester) {
                        console.log("requester");
                        requester(log)
                    })
                    requesters = []; //call the callback just for one element
                })
                olderLogsRequesters[swarm.type] = [];
            })
        }

        function addLogLevel(type){
            for(var listener in typeListeners){
                typeListeners[listener](type);
            }
        }

        function setLogLevels(listener){
            for(var type in logs){
                listener(type);
            }
        }

        function getAnotherChunkOfLogs(type,callback){
            olderLogsRequesters[type].push(callback);
            if(olderLogsRequesters[type].length===1) {

                var earliestTimestamp = new Date(Date.now()).toISOString();
                if(logs[type].length>0)
                    earliestTimestamp = logs[type][logs[type].length - 1].timestamp;

                swarmHub.startSwarm("LogsFetcher.js", 'getOlderLogs', earliestTimestamp, logsChunk, type);
            }
        }

        return {
            enableLoggingService : function(){
                if(enabled === false){
                    startLogger();
                    enabled = true;
                }
            },

            registerForLogs: function (whoAsks,onNewLogs) {
                logsListeners[whoAsks] = onNewLogs;
            },

            getMoreLogs:function(timestampOfLastLog,type,callback){
                var log_to_send;
                var got_log = logs[type].some(function(log){
                    if(timestampOfLastLog>new Date(log.timestamp)){
                        log_to_send = log;
                        return true;
                    }
                    return false;
                })

                if(got_log===false) {
                    getAnotherChunkOfLogs(type,callback);
                }else{
                    callback(log_to_send);
                }
            },

            getLogTypes:function(whoAsks,callback){
                setLogLevels(callback);
                typeListeners[whoAsks] = callback;
            }
        }
    });