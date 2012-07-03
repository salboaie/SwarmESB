/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/7/12
 * Time: 9:06 PM
 * To change this template use File | Settings | File Templates.
 */

/*
 Arguments: scriptsFolder redisHost redisPort

*/

var descriptionsFolder   = "waves";
var redisHost       = "localhost";
var redisPort       = 6379;

if(process.argv.length != 5){
    console.log("Usage: "+ process.argv[1] + " wavesFolder redisHost redisPort");
    console.log("Using default values:"+ "waves localhost 6379");
}
else{
    descriptionsFolder     = process.argv[1];
    redisHost       = process.argv[2];
    redisPort       = process.argv[3];
}

var adaptor = require('./Adaptor.js').init("Core",redisHost,redisPort);
adaptor.uploadDescriptions(descriptionsFolder);
adaptor.loadSwarmingCode();

var cfg = adaptor.readConfig(descriptionsFolder+"/../etc/");
//console.log(cfg);
var childForker = require('child_process');

var forkOptions={
    cwd:process.cwd(),
    env:process.env
};


for(var i=0;i<cfg.processes.length;i++){
    var n = childForker.fork(cfg.processes[i],null,forkOptions);
    n.on('message', function(m) {
        console.log('PARENT got message:', m);
    });
    n.send({ "redisHost": redisHost,"redisPort":redisPort });
}

setTimeout(
    function(){
        adaptor.swarmBegin("LaunchingTest.js");
        adaptor.swarmBegin("BenchMark.js",10000);
    },
1000);



