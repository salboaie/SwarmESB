

if(typeof singleton_semantic_firewall_module_workaround_for_weird_node_js_caching == 'undefined') {
    singleton_semantic_firewall_module_workaround_for_weird_node_js_caching = module;
} else {
    module.exports = singleton_semantic_firewall_module_workaround_for_weird_node_js_caching.exports;
    return;
}


function addUseCase(name, func, paramsDescription, after){

    var newFunc = func;
    if(after){
        newFunc = function(){
            var args = [];
            for(var i= 0,len = arguments.length; i < len; i++){
                args.push(arguments[i]);
            }
            func.apply(this, args);
            after();
        }
    }
    if(name != 'addCheck'){
        this[name]= newFunc;
    } else {
        throw new Error('Cant overwrite addCheck');
    }

    if(paramsDescription){
        this.params[name] = paramsDescription;
    }
}


function alias(name1, name2){
    this[name1] = this[name2];
}


function getParamsSchema(typeName){
    return this.params[typeName];
}

/*
    singleton for adding your various functions for your use cases regarding logging
 */
function LogsCore(){
    this.params = {};
}

/*
 singleton for adding your various functions for assert checks
 */
function AssertCore(){
    this.params = {};
}

/*
 singleton for adding your various functions for assert checks
 */
function CheckCore(){
    this.params = {};
}


/*
 singleton for adding your various functions for generating expcetions
 */
function ExceptionsCore(){
    this.params = {};
}

LogsCore.prototype.addCase           = addUseCase;
AssertCore.prototype.addCheck        = addUseCase;
CheckCore.prototype.addCheck         = addUseCase;
ExceptionsCore.prototype.register    = addUseCase;

LogsCore.prototype.alias             = alias;
AssertCore.prototype.alias           = alias;
CheckCore.prototype.alias            = alias;
ExceptionsCore.prototype.alias       = alias;

/*
 The semantic firewall,can interfere cu
 */

function Firewall(){

}


var assertObj       = new AssertCore();
var checktObj       = new CheckCore();
var exceptionsObj   = new ExceptionsCore();
var firewallObj     = new Firewall();
var loggerObj       = new LogsCore();


exports.assert      = assertObj;
exports.check      = checktObj;
exports.exceptions  = checktObj;
exports.exceptions  = exceptionsObj;
exports.logger      = loggerObj;
exports.firewall    = firewallObj;

require("./standardAsserts.js").init(exports);
require("./standardLogs.js").init(exports);
require("./standardExceptions.js").init(exports);
require("./standardChecks.js").init(exports);


exports.createAggregator = function(){
    return require("./logAggregator.js").createAggregator(exports.logger);
}

var container = require('./container.js');

exports.container    = container.newContainer(exports);
exports.newContainer    = container.newContainer;

process.on('uncaughtException', function (err) {
    console.log(err.stack);
})



//utility function that got copyed in some places... find a better place
exports.mkArgs = function(myArguments, from){
    if(myArguments.length <= from){
        return [];
    }
    var args = [];
    for(var i = from; i < myArguments.length; i++){
        args.push(myArguments[i]);
    }
    return args;
}
