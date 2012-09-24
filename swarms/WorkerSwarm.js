
var workerSwarm =
{
    vars:{
        balancingStrategy:"Round-Robin",
        debug:"false"
    },
    doWork:function(balacingStrategy)  {
        if(balacingStrategy != undefined){
            this.balacingStrategy = balacingStrategy;
        }
        this.swarm("doChooseWorker");
    },
    doChooseWorker:{
        node:"Balancer",
        code : function (){
            this.selectedWorker = chooseWorker(this.balacingStrategy);
            taskBegin(this.selectedWorker);
            this.swarm("executeWork",this.selectedWorker);
        }
    },
    executeWork:{
        node:"*",
        code : function (){
            //doWork();
            this.swarm("taskDone");
        }
    },
    taskDone:{
        node:"Balancer",
        code : function (){
            taskDone(this.selectedWorker);
            this.result = "succes";
            this.swarm("result", this.currentSession());
        }
    }
};

workerSwarm;