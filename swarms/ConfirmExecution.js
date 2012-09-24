/*
    - confirm execution at successful execution of a phase

 */
var confirmExecution = {
    vars:{
    },
    meta:{
        debug:true
    },
    confirm:function (swarm) {
        this.phaseExecutionId = swarm.meta.phaseExecutionId;
        this.setTenantId(swarm.getTenantId());
        this.setSessionId(swarm.getSessionId());
        this.swarm("confirmAtOrigin", swarm.meta.confirmationNode);
    },
    confirmAtOrigin:{
        node:"*",
        code:function () {
            var ctxt = getContext(this.phaseExecutionId);
            ctxt.confirmedExecution = true;
        }
    }
}

confirmExecution;