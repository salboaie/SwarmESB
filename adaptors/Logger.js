/**
 * Logger adapter,overwrite doLog function or log.js swarm to handle logging in your environment
 */

var fs = require("fs");

thisAdapter = require('swarmutil').createAdapter("Logger",onReadyCallback,null,false);

doLog = function(level, nodeName, message) {
    var now = new Date();
    fs.appendFileSync(getSwarmFilePath(thisAdapter.config.logsPath + "/" + nodeName + level.toLowerCase()), now.toDateString() + ' | ' + message + "\n");
}

function onReadyCallback(){
    //startSwarm("LocalBenchMark.js","start",10000);

}
