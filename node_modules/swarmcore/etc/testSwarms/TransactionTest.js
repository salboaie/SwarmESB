/*
    - Launched when a node is started to make sure that only one adapter is executing commands
    - Launched also to make active a redundant node

 */
var transactionTest = {
    vars:{
    },
    start:function () {
        this.swarm("doStart");
    },
    doStart:{
        node:"TestAdapter",
        transaction:function () {
            this.swarm("step10");
            this.swarm("step11");
        },
        done:function(){
            this.swarm("step12");
        }
    },
    step10:{
        node:"TestAdapter",
        do:function () {
            this.swarm("step101");
        },
        finished:function(){
            this.home("home10");
        }
    },
    step101:{
        node:"TestAdapter",
        do:function () {
            this.home("do101");
        },
        finished:function(){
            this.home("home101");
        }
    },
    step11:{
        node:"TestAdapter",
        do:function () {
        },
        done:function(){
            this.swarm("done101");
        },
        finished:function(){
            this.home("home11");
        }
    },
    step12:{
        node:"TestAdapter",
        transaction:function () {
            this.swarm("step101");
        },
        finished:function(){
         this.home("home12");
        }
    }
}

transactionTest;