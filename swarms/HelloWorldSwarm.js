var swarm =
{
    meta: {
        name: "HelloWorldSwarm.js"
    },
    vars: {
        x: 0
    },
    ctor: function () {
        this.swarm("phase");
    },
    phase: {
        node:"HelloWorld",
    code: function () {
        hello();
        }
    }
}

swarm;
