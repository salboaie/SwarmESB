/*
    - confirm execution at successful execution of a phase

 */
var confirmExecution = {
    vars:{
        phaseId:null
    },
    confirm:function (swarm) {
        this.phaseExecutionId = swarm.meta.phaseExecutionId;
        this.swarm("confirmAtOrigin", swarm.meta.fromNode);
    },
    confirmAtOrigin:{
        node:"*",
        code:function () {
            var ctxt = getContext(this.meta.phaseExecutionId);
            ctxt.confirmedExecution = true;
        }
    }
}

confirmExecution;