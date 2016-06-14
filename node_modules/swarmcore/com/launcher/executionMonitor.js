
var childForker = require('child_process');
var fs = require("fs");

function executionMonitor(forkOptions, config, onRestartCallback){
    var adaptorForks = {};

    var forkCounter = 0;
    function createSingleFork(fork, position){
        try{
            fork.proc = childForker.fork(fork.path, fork.forkArgs, forkOptions);
            console.log("Watching ", fork.path);
            if(!fork.watched){
                fork.watched = true;
                fs.watchFile(fork.path, function(event, fileName){
                    console.log("File change detected, killing and restarting ", fork.path);
                    killFork(fork);
                });
            }


            fork.proc.on('message', function (data) {
                fork.alive = true;
                //console.log(adaptorFork.name + " " + JSON.stringify(data));
                if (!data.ok) {
                    fork.messages.push(data);
                }
            });
            fork.name = "Fork[" + forkCounter + "]" + fork.path.substring(fork.path.lastIndexOf('/') + 1, fork.path.length - 3);
            fork.alive = true;
            fork.messages = [];
            index = fork.index;

            if (index) {
                fork.name = '[' + index + '] ' + fork.name;
            }
            console.log("New Launcher fork: ", fork.name);
            return true;
        }catch(err){
            fork.failOnStart = true;
            fork.startErr = err;
            console.log("Unable to fork ", fork.path, fork.startErr);
            return false;
        }
    }

    function restartFork(fork) {
        onRestartCallback(fork);
        killFork(fork);
        if(fork.failOnStart){
         console.log("Unable to refork ", fork.path, fork.startErr);
        } else {
            createSingleFork(fork);
        }
    }

    this.createFork = function(itemConfig, position) {

        var swarmPath = itemConfig.path;

        function monitorSingleFork(){
            var self = this;
            try {
                this.alive = true;
                this.proc.send({data: 'Are you ok?'});
            }
            catch (err) {
                this.alive = false;
            }

            setTimeout(function () {
                if(!self.alive){
                    restartFork(self);
                }
            }, config.responseTimeout);
        }

        var maxIndex = itemConfig.instances;
        for(var index = 0; index < maxIndex; index++){
            var fork = {};
            fork.config = itemConfig;
            fork.index = index;
            fork.path = swarmPath;
            fork.forkArgs = itemConfig.args;
            forkCounter++;
            if(createSingleFork(fork, position)){
                adaptorForks[fork.name] = fork;
                fork.monitorFork = monitorSingleFork.bind(fork);
            }
        }
    }

    function killFork(fork) {
        try {
            fork.proc.removeAllListeners();
            fork.proc.disconnect();
            fork.proc.kill();
        } catch (err) {
            console.log(err);
        }
    }


    this.monitorForks = function () {
        var counter = 0;
        var self = this;
        for (var key  in adaptorForks) {
            adaptorForks[key].monitorFork();
            counter++;
        }
        setTimeout(function(){
            //process.stdout.write(".");
            self.monitorForks();
        }, config.pingTimeout)
        return counter;
    };


    this.killAllForks = function() {
        var fork, key;
        try {
            for (key  in adaptorForks) {
                fork = adaptorForks[key];
                killFork(fork);
            }
        } catch (e) {
            console.log(e);
        }
    }
}


exports.createExecutionMonitor = function(forkOptions, config, onRestartCallback){
    return new executionMonitor(forkOptions, config, onRestartCallback);
}



