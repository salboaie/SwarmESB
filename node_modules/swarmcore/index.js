
if(typeof singleton_swarmCore_module_workaround_for_wired_node_js_caching == 'undefined') {
    singleton_swarmCore_module_workaround_for_wired_node_js_caching = module;
} else {
    module.exports = singleton_swarmCore_module_workaround_for_wired_node_js_caching.exports;
    return;
}

var core = require("./lib/SwarmCore.js");
var clientModule = require("./nodeClient/NodeClient.js");

exports.createClient = clientModule.createClient;
exports.createAdapter = core.createAdapter;


exports.runLauncher = function(){
    return exports.runNode("etc/adapters/Launcher.js")
}

exports.runNode = function(path){
    var fork = require('child_process').fork(exports.getCorePath() + path);
    function killFork(){
        fork.kill();
    }
    process.on('exit',      killFork);
    process.on('SIGTERM',   killFork);
    process.on('SIGHUP',    killFork);
    process.on('SIGINT',    killFork);
}


exports.getCorePath = function(path){
    if(path){
        return __dirname+"/"+ path;
    } else {
        return __dirname+"/";
    }
}

exports.getSwarmFilePath = getSwarmFilePath;