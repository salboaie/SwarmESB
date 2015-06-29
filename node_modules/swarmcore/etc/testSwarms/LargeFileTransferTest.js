/*
    - Launched when a node is started to make sure that only one adapter is executing commands
    - Launched also to make active a redundant node

 */
var largeFileTransferTest = {
    startFileTransfer:function () {
        console.log("Starting fileTransferTest");
        this.swarm("node1Phase");
    },
    node1Phase:{
        node:"Node1",
        code:function () {
            var filename = "d:/work/test_large_file.zip";
            var self = this;
            self.fileName =  filename;
            thisAdapter.fileBus.transferFile(self.fileName, "FB_Node2",self, "node2Confirm");
        }
    },
    node2Confirm:{
        node:"Node2",
        do:function () {
            //waked up when transfer was done
            console.log("File: ", this.fileName, " from node1 is now copied in node2 in ", this.__payload);
            this.result = "Passed";
            console.log("Result:", this.result, M(this));
            this.home("result");
        }
    }
}

largeFileTransferTest ;