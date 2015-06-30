var debug = console.log;
var uuid  = require('node-uuid');

ParallelSwarmTests = {
    vars: {
        myuuid: 0,
        payload: 0
    },
    start: function (id) {
        debug('Starting Parallel Test Swarm ' + id);
        this.myuuid = id;
        this.payload = uuid.v1();
        this.swarm('first');
    },
    first: {
        node: "DemoBroadcast",
        code: function () {
            debug('Swarm ' + this.myuuid + ' entered MindBodyAdapter ');
            adapterDebugMessage('Swarm ' + this.myuuid + ' payload is: ' + this.payload);
            this.swarm('second');
        }
    },
    second: {
        node: "DemoBroadcast",
        code: function () {
            var self = this;
            debug('Swarm ' + this.myuuid + ' entered ParseAdapter ');
            adapterDebugMessage('Swarm ' + this.myuuid + ' payload is: ' + this.payload,
                createSwarmCallback(function(){
                    self.swarm('third');
                }));
        }
    },
    third: {
        node: "DemoBroadcast",
        code: function () {
            debug('Swarm ' + this.myuuid + ' entered CalendarAdapter ');
            adapterDebugMessage('Swarm ' + this.myuuid + ' payload is: ' + this.payload);
            this.swarm('fourth');
        }
    },
    fourth: {
        node: "DemoBroadcast",
        code: function () {
            debug('Swarm ' + this.myuuid + ' entered ConductorAdapter ');
            adapterDebugMessage('Swarm ' + this.myuuid + ' payload is: ' + this.payload);
        }
    }
};

ParallelSwarmTests;
