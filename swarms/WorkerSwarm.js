
var workerSwarm =
{
    vars:{
        debug:"true1"
    },
    doWork:function(balacingStrategy)  {
        this.balacingStrategy = balacingStrategy;
        this.swarm("doChooseWorker");
    },

    register:function(workerName){
        this.workerName = workerName;
        this.swarm("doRegister");
    },
    unregister:function(workerName){
        this.workerName = workerName;
        this.swarm("doUnregister");
    },
    checkWorkerStatus: function(adaptorName){ //running only in a timer from Balancer
        this.pingTime = Date.now();
        for(var worker in getAllWorkers()) {
            this.workerName = worker;
            this.swarm("statusCheck",worker);
        }
    },

    doRegister:{ //phase that should be replaced. Use your own logging logic
        node:"Balancer",
        code : function (){
            registerWorker(this.workerName);
        }
    },
    doUnregister:{ //phase that should be replaced. Use your own logging logic
        node:"Balancer",
        code : function (){
            unregisterWorker(this.workerName);
        }
    },
    statusCheck:{
    node:"*",
        code : function (){
            this.pongTime = Date.now();
            this.swarm("statusAcknowledge",worker);
        }
    },
    statusAcknowledge:{
        node:"Balancer",
        code : function (){
            workerIsAlive(this.workerName,this.pingTime,this.pongTime);
        }
    },
    doChooseWorker:{
        node:"Balancer",
        code : function (){
            var worker = chooseWorker(this.balacingStrategy);
            taskBegin(this.workerName);
            this.swarm(doWork,worker);
        }
    },
    doWork:{
        node:"*",
        code : function (){
            //doWork();
            doLog(thisAdaptor.nodeName + "is working! ");
            this.swarm("taskDone");
        }
    },
    taskDone:{
        node:"Balancer",
        code : function (){
            taskDone(this.workerName);
        }
    }
};

workerSwarm;