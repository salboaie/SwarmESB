/*
 Arguments: configFile
*/


var redisHost       = "localhost";
var redisPort       = 6379;

var basicConfigFile =  "etc/core";

if(process.argv.length >= 3){

    if(process.argv[2] == "help"){
     console.log("core [config file]");
     process.exit(-1);
    }
    else{
        basicConfigFile = process.argv[2];
    }
}

var cfg             = require('swarmutil').readConfig(basicConfigFile);
descriptionsFolder  = cfg.swarmsfolder;
redisHost           = cfg.redisHost;
redisPort           = cfg.redisPort;

var adaptor = require('swarmutil').createAdaptor("Core",redisHost,redisPort,descriptionsFolder);

var childForker = require('child_process');

var forkOptions;


for(var i=0;i<cfg.adaptors.length;i++){
    forkOptions = {
        cwd:process.cwd(),
        env:process.env
    };
    var n = childForker.fork(cfg.adaptors[i],null,forkOptions);
    n.on('message', function(m) {
        console.log('PARENT got message:', m);
    });
    n.send({ "redisHost": redisHost,"redisPort":redisPort });
}

setTimeout(
    function(){
        startSwarm("LaunchingTest.js","start");
        startSwarm("BenchMark.js","ctor",24000);
    },
1000);



