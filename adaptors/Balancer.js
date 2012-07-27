/*
    Used to store temporary state for swarms.
 */


var thisAdaptor;
thisAdaptor = require('swarmutil').createAdaptor("Balancer");

function workerStatus(workerName){
    this.workerName = workerName;
    this.loadCounter = 0;
    this.lastResponseTime = 0;
    this.lastAliveCheck = Date.now();
    return this;
}

var workers = {};
var workersArray = [];

registerWorker  = function(workerName){

    if(workers[workerName] != null){
        var pos = workersArray.indexOf(workers[workerName]);
        workersArray.splice(pos,1);
    }
    workers[workerName] = new workerStat(workerName);
    workersArray.push(workers[workerName]);
}

unregisterWorker  = function(workerName){
    if(workers[workerName] != null){
        var pos = workersArray.indexOf(workers[workerName]);
        workersArray.splice(pos,1);
    }
    delete workers[workerName];
}

getAllWorkers = function(){
    return workersArray.map(function(ws){
        return ws.workerName;
    });
}

var robinPos = -1;
function roundRobin(){
    if(workersArray.length !=0){
        robinPos++;
        robinPos %= workersArray.length;
        return workersArray[robinPos].workerName;
    }
    else{
        logInfo("Wired & Warning failure: Choosing Null* node as worker...");
        return "Null*";
    }
}

function chooseRandom(){

    if(workersArray.length !=0){
        var rand = parseInt(Math.random()) % workersArray.length;
        return workersArray[rand].workerName;
    }
    else{
        logInfo("Wired & Warning failure: Choosing Null* node as worker...");
        return "Null*";
    }
}


function lightLoadChoose(){
    if(workersArray.length !=0){
        var minPos      = 0;
        var minValue    = 0;
        for(var i=0;i<workersArray.length;i++){
            if(workersArray[i].loadCounter <minValue){
                minPos = i;
                minValue = workersArray[i].loadCounter;
            }
        }
        return workersArray[minPos].workerName;
    }
    else{
        logInfo("Wired & Warning failure: Choosing Null* node as worker...");
        return "Null*";
    }
}

chooseWorker = function(balacingStrategy){
    if(balacingStrategy == undefined){
        balacingStrategy = "Round-Robin";
    }
    if(balacingStrategy == "Round-Robin"){
        return roundRobin();
    } else
    if(balacingStrategy == "random"){
        return chooseRandom();
    } else
    if(balacingStrategy == "load"){
        return lightLoadChoose();
    }
    else{
          logInfo("Unknown balancing name " + balacingStrategy +", defaulting...");
        return roundRobin();
    }
}


workerIsAlive = function (workerName,pingTime,pongTime){
    workers[workerName].lastResponseTime = pongTime - pingTime;
}

taskDone = function (workerName){
    workers[workerName].loadCounter--;
}


taskBegin = function(workerName){
    workers[workerName].loadCounter++;
}




