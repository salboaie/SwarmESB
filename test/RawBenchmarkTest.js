
var totalCount = 500000;

var swarm = {"counter":0};
var queue = new Array();

function consumeSwarm(){
    var rec = queue.shift();
    swarm = rec.swarm;

    try{
        swarm.func();
        rec.funct(null,null);
    }
    catch(err){
        rec.funct(err,null);
    }
}

function defErr(err,succ){

}

function publishSwarm(channel,swarm,funct){
    if(channel[0] == "#"){
        //local channel, just execute
        queue.push({"channel":channel,"swarm":swarm,"funct":funct,"message":JSON.stringify(swarm)});
        process.nextTick(consumeSwarm)
    }
}


function tick(){
    //console.log("tick");
    swarm.func = count;
    publishSwarm("#channel",swarm,defErr);
}

function count(){
    //console.log("count");
    swarm.counter++;
    if(swarm.counter >= totalCount/2 ){
        printResults();
    }else{
        swarm.func =  tick;
        publishSwarm("#channel",swarm,defErr);
    }
}

function printResults(){
    var ct = Date.now();
    var diff = (ct - startTime)/1000;
    var speed = "Not enough phases requested!";
    if(diff != 0){
        speed = "" + Math.ceil(totalCount / diff) + " phases per second!";
    }
    console.log("Raw process benchmark results: " + speed + " Time spent: " + diff + "seconds ");
}

var startTime = Date.now();
tick();
