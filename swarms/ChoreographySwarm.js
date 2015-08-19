
var choreography = {
        start:function () {
            this.swarm("jumpInResearch");

    },
    jumpInResearch:{
        node:"!RESEARCH/Core",
        code:function () {
            console.log("Running ChoreographySwarm.js in ", thisAdapter.nodeName);
            this.swarm("jumpHome");
        }
    },
    jumpHome: {
        node: "!RESEARCH/DemoBroadcast",
        code: function(){
                console.log("Running ChoreographySwarm.js in ", thisAdapter.nodeName);
                this.success = true;
                this.home("Success");
            }
    }
}

choreography;
