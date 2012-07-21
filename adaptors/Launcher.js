/*
 Arguments: none
*/

var adaptor = require('swarmutil').createAdaptor("Launcher");

var childForker = require('child_process');

var forkOptions;
var forLaunch = adaptor.config.Launcher.autorun;

for(var i=0; i<forLaunch.length; i++){
    forkOptions = {
        cwd:process.cwd(),
        env:process.env
    };
    var n = childForker.fork(forLaunch[i],null,forkOptions);
    n.on('message', function(m) {
        console.log('PARENT got message:', m);
    });
    //n.send({ "redisHost": redisHost,"redisPort":redisPort,"shardId":shardId});
}

setTimeout(
    function(){
        startSwarm("LaunchingTest.js","start");
        //startSwarm("BenchMark.js","ctor",48000);
    },
1000);



