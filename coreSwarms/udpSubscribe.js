var subscribeSwarm= {
    vars:{
        currentInstanceUID:null,
        debug:null
    },
    subscribe:function (channel, nodeName) {
        this.nodeName = nodeName;
        this.swarm("addSubscriber", channel);
    },
    addSubscriber: {
        node: "*",
        code: function () {

        }
    }
}

subscribeSwarm;