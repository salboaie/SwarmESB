
/* why Function prototype implementation*/

if(typeof singleton_why_module_workaround_for_wired_node_js_caching == 'undefined') {
    singleton_why_module_workaround_for_wired_node_js_caching = module;
} else {
    module.exports = singleton_why_module_workaround_for_wired_node_js_caching.exports;
    return;
}


var enableLogs = false;

var sf = require("double-check");
var check = sf.check;
var logger  = sf.logger;



function newTrackingItem(str, args, otherContextInfo){
    var a = [];
    for(var i = 0; i < args.length; i++){
        try{

            if(args[i] && args[i].constructor === Function){
                a.push('function');
            } else {
                if(JSON.stringify(args[i])){
                    a.push(args[i]);
                }
            }
        } catch(err){
            //console.log(err);
            a.push("UNKNOWN")
        }
    }
    return {step:str, args:a, other:otherContextInfo};
}

var globalCurrentContext = null;

function TrackingContext(){
    var trackingContext = [];
    var contextHistory = [];
    this.exceptionContextSource = undefined;

    function stickyItem(item){
        var pref = trackingContext[0];
        if(pref && pref.args.order_equals(item.args)) {
            pref.step += "\n";
            pref.step += item.step;
            return true;
        }
        return false;
    }

    if(enableLogs) console.log("Creating a new context...");

    this.push = function(item){
        if(enableLogs) console.log("Push ",trackingContext.length, contextHistory.length, item.step );
        if(!stickyItem(item)){
            trackingContext.unshift(item);
        }
    }

    this.pop = function(item){
        var item =  trackingContext.shift(item);
        if(item){
            if(enableLogs) console.log("Pop ",trackingContext.length, contextHistory.length, item.step );
            contextHistory.push(item);
        }
    }

    this.topLevel = function(){
        return trackingContext.length == 0;
    }

    this.print = function(){
        console.log("Execution context:");
        trackingContext.forEach(function(item){
            console.log("\t",item.step);
        })
    }

    this.dump = function(text, err){
        var ret = {
            whystack:trackingContext,
            history:contextHistory,
            exceptionContextSource: this.exceptionContextSource
        }

        if(text){
            ret.description = text;
        }

        if(err){
            ret.err = err;
        }

        if(this.exceptionContextSource){
            ret.exceptionContextSource = this.exceptionContextSource;
        }
        return ret;
    }

    var counter = 0;
    this.inc = function(){
        counter++;
    }

    this.dec = function(){
        counter--;
        if(counter ==0){
            logger.logWhy(globalCurrentContext.dump());
        }
    }
}

var globalWhyStackLevel = 0;

Function.prototype.why = function(description, otherContextInfo, externalBinder){
    var self = this;
    var savedContext = globalCurrentContext;
    var referenceClosure = false;
    if(globalCurrentContext){
        globalCurrentContext.inc();
        referenceClosure = true;
    }

    var whyFunc = function(){

        var ret = undefined;
        if(!globalCurrentContext){
            if(savedContext){
                globalCurrentContext = savedContext;
            } else {
                globalCurrentContext = new TrackingContext();
            }
        }

        try {
            globalCurrentContext.push(newTrackingItem(description, arguments, otherContextInfo));
            globalWhyStackLevel++;
            ret = self.apply(this, arguments);
            globalWhyStackLevel--;
            globalCurrentContext.pop();
            if(referenceClosure) {
                globalCurrentContext.dec();
            }
        } catch(err) {
            if(!globalCurrentContext.exceptionContextSource){
                globalCurrentContext.exceptionContextSource = description;
            }
            globalCurrentContext.pop();
            if(referenceClosure) {
                globalCurrentContext.dec();
            }
            if(globalCurrentContext.topLevel()){
                try{
                    logger.error("Unexpected exception thrown outside of the why context ", err, arguments, 0, globalCurrentContext.dump());
                }catch(nerr){
                    console.log("Failed to log this error. Probably missing the logsCore.record function. Original error:", err, err.stack,nerr )
                }
            }
            throw err;
        }

        if(globalWhyStackLevel == 0 && globalCurrentContext.topLevel()){
            if(enableLogs) console.log("Clearing context...");
            globalCurrentContext = null;
        }
        return ret;
    }

    if(externalBinder){
        globalCurrentContext.externalBinder = externalBinder;
    }

    if(globalCurrentContext && globalCurrentContext.externalBinder){
        return globalCurrentContext.externalBinder(whyFunc);
    } else {
        return whyFunc;
    }

};


module.exports.printContext = function(){
    globalCurrentContext.print();
}

module.exports.dumpText = function(){
    var obj = globalCurrentContext.dump();
    console.log(JSON.stringify(obj));
}

module.exports.dump = function(){
    if(globalCurrentContext){
        return globalCurrentContext.dump();
    } else {
        return {};
    }
}


///////////////////////////////