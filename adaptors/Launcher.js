/*
 Arguments: none
*/

var adaptor = require('swarmutil').createAdaptor("Launcher",onReadyCallback);

var childForker = require('child_process');

var forkOptions;
var forLaunch = adaptor.config.Launcher.autorun;

for(var i=0; i<forLaunch.length; i++){
    if(typeof forLaunch[i] == "string" ){
        forkOptions = {
            cwd:process.cwd(),
            env:process.env
        };
        childForker.fork(forLaunch[i],null,forkOptions);
    }
    else{
        var multipleCmdsObj = forLaunch[i];
        for (var v in multipleCmdsObj){
            var count = parseInt(v);
            for(var j=0;j<count; j++){
                forkOptions = {
                    cwd:process.cwd(),
                    env:process.env
                };
                childForker.fork(multipleCmdsObj[v],null,forkOptions);
            }
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



