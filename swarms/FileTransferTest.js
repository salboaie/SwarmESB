/*
    - Launched when a node is started to make sure that only one adapter is executing commands
    - Launched also to make active a redundant node

 */
var fileTransferTest = {
    startFileTransfer:function () {
        console.log("Starting fileTransferTest");
        this.swarm("node1Phase");
    },
    node1Phase:{
        node:"Node1",
        code:function () {
            var filename = swarmTempFile.async();
            var self = this;
            (function(filename){
                self.fileName =  filename;
                self.fileContent = "Test content";
                require("fs").writeFileSync(filename, self.fileContent);
                self.shareFile(self.fileName, "node2Confirm");
            }).swait(filename);
        }
    },
    node2Confirm:{
        node:"!RESEARCH/Node2",
        do:function () {
            var fs = require("fs");
            //waked up when transfer was done
            console.log("File: ", this.fileName, " from Node1 is now available for node2 as ", this.__transferId);
            var fileName = "tmp/"+this.__transferId;
            var self = this;
            this.download(this.__transferId, fileName, S(function(err, res){
                if(require("fs").readFileSync(fileName) == self.fileContent){
                    self.result = "Passed";
                } else {
                    self.result = "Failed";
                }
                fs.unlink(fileName);
                fs.unlink(self.fileName);
                self.unshare(self.__transferId);
                self.home("result");
            }))
        }
    }
}

fileTransferTest;