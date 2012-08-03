
var workerSwarm =
{
    vars:{
        debug:"true"
    },
    doWork:function(balacingStrategy)  {
        this.balacingStrategy = balacingStrategy;
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
            //doLog(thisAdaptor.nodeName + "is working! ");
            this.swarm("taskDone");
        }
    },
    taskDone:{
        node:"Balancer",
        code : function (){
            taskDone(this.selectedWorker);
            this.result = "succes";
            this.swarm("result", this.sessionId);
        }
    }
};

workerSwarm;