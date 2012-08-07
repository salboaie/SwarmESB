/*
 Arguments: none
*/

var adaptor = require('swarmutil').createAdaptor("Launcher",onReadyCallback);

var childForker = require('child_process');

var forkOptions;
var forLaunch = getMyConfig().autorun;

var howMany;


for(var i=0; i<forLaunch.length; i++){
    var cmdObj = forLaunch[i];
    if(cmdObj.node == undefined){
        logErr("Wrong adapter configuration: no \"node\" property where required when starting auto loading \n");
    }
    if(cmdObj.enabled == undefined || cmdObj.enabled == true){
        howMany = cmdObj.times;
        if(howMany  == undefined){
            howMany = 1;
        }
        for(var k=0; k<howMany; k++){
            forkOptions = {
                cwd:process.cwd(),
                env:process.env
            };
            childForker.fork(cmdObj.node,null,forkOptions);
        }
    }
}


function onReadyCallback(){
    startSwarm("LaunchingTest.js","start");
}

/*
 var n = childForker.fork(forLaunch[i],null,forkOptions);
n.on('message', function(m) {
 console.log('PARENT got message:', m);
 //n.send({ "redisHost": redisHost,"redisPort":redisPort,"shardId":shardId});
 }); */



