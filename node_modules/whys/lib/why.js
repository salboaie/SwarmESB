/* why Function prototype implementation*/


var logger = require('double-check').logger;

function newTrackingItem(motivation,caller){
    return {
        step:motivation,
        parent:caller,
        children:[],
        id:caller.context.getNewId(),
        context:caller.context,
        indexInParentChildren:caller.hasOwnProperty('children')?caller.children.length:0
    };
}

var contexts = [];

var globalCurrentContext = null;

exports.getGlobalCurrentContext = function(){
    if(process.env['RUN_WITH_WHYS']) {
        return globalCurrentContext;
    }
    else{
        throw new Error('Why is not activated\nYou must set env variable RUN_WITH_WHYS to true to be able to use whys')
    }
}

exports.getAllContexts = function(){
    return contexts;
}


function logAllContexts(){
    if(process.env['RUN_WITH_WHYS']) {
        logger.logWhy();
    }
}
process.on('exit', logAllContexts);


function TrackingContext(){
    var self = this;
    var lastId = 0;
    this.getExecutionSummary = function(){
        var summary = {}
        self.startingPoint.children.forEach(function(child){
            summary[child.step] = getNodeSummary(child);
        })

        function getNodeSummary(node){
            var summary = {};
            summary.args = node.args;
            summary.stack = node.stack;
            if(node.exception){
                summary.exception = node.exception;
            }else{
                if(node.children.length>0){
                    summary.calls = {};
                    node.children.forEach(function(child){
                        summary.calls[child.step] = getNodeSummary(child);
                    })
                }
            }
            return summary;
        }

        return summary;
    }
    this.getNewId = function(){return lastId++}
    this.currentRunningItem = newTrackingItem("Context starter",{context:self});
    this.startingPoint = this.currentRunningItem;
    contexts.push(this);
}

var globalWhyStackLevel = 0;

Function.prototype.why = function(motivation, caller,otherContextInfo, externalBinder){
     if(!process.env["RUN_WITH_WHYS"]){
        return this;
     }
    var self = this;
    /*
    if(!motivation){
        motivation = this.name;
    }else {
        motivation = this.name + " " + motivation;
    }*/
    var newContext = false;
    var thisItem;
    linkToContext();


    var whyFunc = function(){
        updateContext(thisItem);
        addArgs(arguments,thisItem);
        attatchStackInfoToItemWHY(thisItem,newContext,globalWhyStackLevel);
        resolveEmbeddingLevel(thisItem);
        var result = executeWHYFunction(self,thisItem,arguments);
        //maybeLog(globalCurrentContext);
        returnFromCall(thisItem);
        return result
    }
    return whyFunc;

    function linkToContext(){
        if(!caller){
            if (globalWhyStackLevel === 0) {
                globalCurrentContext = new TrackingContext();
                newContext = true;
            }
            thisItem = newTrackingItem(motivation, globalCurrentContext.currentRunningItem);
            globalCurrentContext.currentRunningItem.children.push(thisItem);
        }
        else{
            thisItem = newTrackingItem(motivation,caller);
            caller.children.push(thisItem);
        }
    }

    function attatchStackInfoToItemWHY(item,newContext,globalWhtStackLevel) {
        var stack = new Error().stack.split("\n");

        stack.shift();

        stack = dropLinesMatching(stack, ["WHY"]);

        item.whyEmbeddingLevel = getWhyEmbeddingLevel(stack);
        item.stack = getRelevantStack(item, stack);
        item.isCallback = (globalWhyStackLevel === item.whyEmbeddingLevel - 1) && (!newContext);


        function getWhyEmbeddingLevel(stack) {
            var whyEmbeddingLevel = 0;
            stack.some(function (stackLine) {
                if (stackLine.match("whyFunc") !== null || stackLine.match("at whyFunc") !== null) {
                    whyEmbeddingLevel++;
                    return false;
                }
                return true;
            })
            return whyEmbeddingLevel;
        }

        function getRelevantStack(trackingItem, stack) {
            if (trackingItem.isCallback) {
                stack = [];
                stack.push(trackingItem.parent.stack[0]);
                stack.push("       After callback");
                return stack;
            }
            else {
                if (!trackingItem.parent.hasOwnProperty("stack")) {
                    return dropWhysFromStack(stack);
                }
                var keep = true;
                var firstRedundantStackLine = trackingItem.parent.stack[0];

                return dropWhysFromStack(stack.filter(function (stackLine) {
                    if (stackLine === firstRedundantStackLine) {
                        keep = false;
                    }
                    return keep;
                }))
            }
            function dropWhysFromStack(stack) {
                var whyMatches = ["whyFunc"];
                return dropLinesMatching(stack, whyMatches);
            }
        }

        function dropLinesMatching(stack, lineMatches) {
            return stack.filter(function (stackLine) {
                var ret = true;
                lineMatches.forEach(function (lineMatch) {
                    if (stackLine.match(lineMatch) !== null) {
                        ret = false;
                        return true;
                    }
                    return false;
                })
                return ret;
            })
        }
    }

    function resolveEmbeddingLevel(item){
        if(item.whyEmbeddingLevel>1) {
            item.step += " AND " + item.parent.children.splice(item.indexInParentChildren +1, 1)[0].step;
            item.parent.children.forEach(function(children){
                if(children.indexInParentChildren>item.indexInParentChildren){
                    children.indexInParentChildren--;
                }
            })
        }
    }

    function addArgs(args,item){

        var a = [];
        for(var i = 0; i < args.length; i++){
            if(typeof args[i] === "function"){
                a.push("function");
                continue;
            }

            try{
                a.push(JSON.stringify(args[i]));
            } catch(err){
                a.push("Unserializable argument of type "+typeof args[i]);
            }
        }
        item.args = a;
    }

    function updateContext(item){
        globalCurrentContext = item.context;
        globalCurrentContext.currentRunningItem = item;
    }

    function executeWHYFunction(func,item,args) {
        var previousGlobalWhyStackLevel = globalWhyStackLevel;
        try {
            globalWhyStackLevel++;
            item.result = func.apply(func, args);
            item.done = true;
            globalWhyStackLevel--;
            return item.result;
        }
        catch (exception) {
            globalWhyStackLevel = previousGlobalWhyStackLevel;
            if(!exception.logged){
                exception.logged = true;
                item.exception = exception;
                item.done = true;
                globalCurrentContext.currentRunningItem = item.parent;
            }
            throw exception;
        }
        return item.result;
    }

    function returnFromCall(item){
        globalCurrentContext.currentRunningItem = item.parent;
    }

    function maybeLog(context){
        if(globalWhyStackLevel === 0){
            logger.logWhy();
        }
    }
};
