/*
 0 system level critical error: hardError
 1 potentially causing user's data loosing error: error
 2 minor annoyance, recoverable error:   logError
 3 user experience causing issues error:  uxError
 4 warning,possible isues but somehow unclear behaviour: warn
 5 store general info about the system working: info
 6 system level debug: debug
 7 local node/service debug: ldebug
 8 user level debug; udebug
 9 development time debug: ddebug

 - 'category    ': the field is usable to create indexes for logs. The mandatory field "type" is such ca category but you can add other. One can see ca category
 - 'level'       : number friom 1-9, identify the level of attention that a log entry should get from operations point of view
 - 'time'        : a value that uniquely identifies in time the log. This parameter is mandatory and normally automatically instantiated by core logging functions
 - 'explanation' : part of the description, environment values relevant for values. All parameters have this aspect so you don't declare
 - 'stack'       : describe an execution stack that caused the log entry
 - 'filename'    : path of a file causing or related to the log entry
 - 'key part'    : a set of fields that together create a key (category)
 - 'swarm'       : the current swarm name (SwarmESB specific)
 - 'phase'       : the current phase name (SwarmESB specific)
 - 'mainGroup'   : the type of the addapter  (SwarmESB specific)
 - 'adapter'     : the uid of the current adapter instance ((SwarmESb specific))
 - 'process'     : the uid of a swarm process (or a process) that automatically stick multiple logs entries together
 - 'var args'    : potential variable number of args

 */

exports.init = function(sf){

    function createDebugRecord(level, type, message, exception, saveStack, args, pos, data){
    var ret = {
            level: level,
            type:type,
            timestamp:(new Date()).getTime(),
            message: message,
            data:data
        };

        if(saveStack){
            var stack = '';
            if(exception){
                stack = exception.stack;
            } else {
                stack  = (new Error()).stack;
            }
            ret.stack = stack;
        }
        if(exception){
            ret.exception = exception;
        }

        if(args){
            var argsArray = [];
            for(var i= pos, len= args.length; i< len; i++)
            ret.args = argsArray;
        }

        if(typeof system_working_with_swarmCore_library_do_not_touch_please != 'undefined'){
            ret.swarmName           = getCurrentSwarm();
            ret.currentUser         = getCurrentUser(true);
            ret.tenant              = getCurrentTenant(true);
            ret.outletId            = getCurrentOutletId(true);
            ret.sessionId           = getCurrentSession(true);
            ret.swarmProcess        = getCurrentSwarmProcess(true);
            ret.swarmPhase          = getCurrentSwarmPhase(true);
        }

        return ret;
    }

    sf.logger.addCase('hardError', function(message, exception, args, pos, data){
        sf.logger.record(createDebugRecord(0, 'systemError', message, exception, true,args, pos, data));
    }, [
        {
            'message':'explanation'
        }
    ]);

    sf.logger.addCase('error', function(message, exception, args, pos, data){
        sf.logger.record(createDebugRecord(1, 'error', message, exception, true, args, pos, data));
    }, [
        {
            'message':'explanation'
        },
        {
            'exception':'exception'
        }
    ]);

    sf.logger.addCase('logError', function(message, exception, args, pos, data){
        sf.logger.record(createDebugRecord(2, 'logError', message, exception, true, args, pos, data));
    }, [
        {
            'message':'explanation'
        },
        {
            'exception':'exception'
        }
    ]);

    sf.logger.addCase('uxError', function(message){
        sf.logger.record(createDebugRecord(3, 'uxError', message, null, false));
    }, [
        {
            'message':'explanation'
        }
    ]);

    sf.logger.addCase('throttling', function(message){
        sf.logger.record(createDebugRecord(3, 'throttling', message, null, false));
    }, [
        {
            'message':'explanation'
        }
    ]);

    sf.logger.addCase('warning', function(message){
        sf.logger.record(createDebugRecord(4, 'warning', message,null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);
    
    sf.logger.alias('warn', 'warning');

    sf.logger.addCase('info', function(message){
        sf.logger.record(createDebugRecord(5, 'info', message,null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);


    sf.logger.addCase('debug', function(message){
        sf.logger.record(createDebugRecord(6, 'debug', message,null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);


    sf.logger.addCase('ldebug', function(message){
        sf.logger.record(createDebugRecord(7, 'ldebug', message, null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);

    sf.logger.addCase('udebug', function(message){
        sf.logger.record(createDebugRecord(8, 'udebug', message ,null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);

    sf.logger.addCase('devel', function(message){
        sf.logger.record(createDebugRecord(9, 'devel', message, null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);

    sf.logger.addCase("logWhy", function(dump){
       console.log("logWhy dummy implementation. Overwrite the logWhy function in the logger");
        console.log("Dump:", dump);
    });
}