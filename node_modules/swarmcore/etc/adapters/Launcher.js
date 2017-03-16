

/**********************************************************************************************
 * new Launcher for usage from
 **********************************************************************************************/
var core = require ("swarmcore");


var config, forkOptions;

var executionSteps = {}; /* object with key 0,1,..,10*/
function pushInStep(step,item){
    var stepList = executionSteps[step];
    if(!stepList){
        stepList = [];
        executionSteps[step] = stepList;
    }
    stepList.push(item);
}

function NodeConfig(key){
    /*
        path: executable path
        instances: number of instances
        args: other arguments,
        enabled: boolean
     */
}

function configure(){

    config = getMyConfig("Launcher");
    forkOptions = {
        cwd: process.cwd(),
        env: process.env
    };

    if(!config.stepsDelay){
        config.stepsDelay = 500; //half seconds
    }


    if(!config.pingTimeout){
        config.pingTimeout = 10000; //10 seconds
    }

    if(!config.responseTimeout){
        config.responseTimeout = 1000; //1 second
    }

    var watch = config.watch;
    if(!watch || watch.length <= 0){
        console.log("Watch sections missing or not an array. Exiting...");
        process.exit(-1);
    }

    for(var i = 0, len = watch.length; i < len; i++ ){

        var p = watch[i];

        var name = p.node;
        var path;

        if(!name){
            name = p.core;
            path = core.getCorePath() + name;
        } else {
            path = core.getSwarmFilePath(name);
            console.log("Path:", path);
        }
        if(!name){
            console.log("Ignoring watch configuration, missing node or core property ", p);
        }

        var item = new NodeConfig(name);
        item.path = path;
        item.instances  = p.instances;
        if(!item.instances){
            item.instances = 1;
        }
        item.args       = p.args;
        var step        = p.step;
        if(!step){
            step = 10;
        }
        if(p.enabled){
            pushInStep(step, item);
        }
    }
    return config;
}

function startAdapters(monitor, endCallback){
    var currentStep = 0;
    function doNextStep(){
        currentStep++;
        if(currentStep < 11){
            var items = executionSteps[currentStep];
            if(items){
                for(var v = 0, len = items.length; v < len;v++){
                    monitor.createFork(items[v], v);
                }
                setTimeout(doNextStep, config.stepsDelay);
            } else {
                doNextStep();
            }
        } else {
            endCallback();
        }
    }
    doNextStep();
}

/*

    Start Launcher
 */

var subprocessesCounter = 0;
var globalAdaptersRestartsCounter = 0;
function onRestart(fork){
    globalAdaptersRestartsCounter++;
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>> restart:", globalAdaptersRestartsCounter);
}

config = configure();
var monitor = require ("../../com/launcher/executionMonitor.js").createExecutionMonitor(forkOptions, config, onRestart);
process.on('exit',      monitor.killAllForks);
process.on('SIGTERM',   monitor.killAllForks);
process.on('SIGHUP',    monitor.killAllForks);
process.on('SIGINT',    monitor.killAllForks);
startAdapters(monitor, function(){
    console.log("Finally creating launcher adapter...");
    core.createAdapter("Launcher");
    subprocessesCounter = monitor.monitorForks();
});


getLauncherStatus = function(){
    return {
        "launcherId":thisAdapter.nodeName,
        "adaptersCounter": subprocessesCounter,
        "restartsCounter": globalAdaptersRestartsCounter
    }
}

console.log("Launcher: ", getLauncherStatus , process.env.SWARM_PATH);