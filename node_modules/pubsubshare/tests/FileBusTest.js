/*
eyJ1cmwiOiJsb2NhbGhvc3Q6MzAwMCIsImNvZGUiOiJRMFZwVFRoa1pYbFZjV05rU1VFOVBRbz0iLCJrZXkiOiJXbGhOYW5KSmQwdGtlbHBxVTNjOVBRbz0ifQ==

 eyJ1cmwiOiJsb2NhbGhvc3Q6MzAwMCIsImNvZGUiOiJPVzFFTm5NM1VqZGhVWHBDYUVFOVBRbz0iLCJrZXkiOiJibFEyUmtGbWJsTnRlVGRpSzJjOVBRbz0ifQ==
*/

var psc = require("../relay/relay.js");
var assert = require("double-check").assert;
var fs = require("fs");

assert.begin("Testing basic file transfer");


var abhttps  = require("https-auto");
abhttps.cacheOrganisation("ORG1", {
    server:"localhost",
    port:8000
});

//organisationName, redisHost, redisPort, publicHost, publicPort, keySpath, filesPath

function errorReporting(err, res){
    if(err){
        console.log(err.stack);
    }
}

var relay1 = psc.createRelay("ORG1", "localhost", 6379, undefined, "localhost", 8000, "tmp", "tmpDownload", errorReporting);


var c1 = psc.createClient("localhost", 6379, undefined, "tmp", errorReporting);


assert.callback("File transfers works in the same organisation", function(end){
    c1.shareFile("tmp/testFile", function(err, transferId){
        try{
            fs.unlinkSync("tmp2/testFile_dnld");
        } catch(error){
            //console.log(error);
        }
        console.log("Uploaded...");
        if(!err){
            c1.download(transferId, "tmp2/testFile_dnld", function(err, result){
                console.log("Downloaded...", err);
                var content = fs.readFileSync("tmp2/testFile_dnld");
                assert.equal(content, "[[[testFile content]]]");
                c1.unshare(transferId, function(){
                    end();
                });
            })
        }
    });
})








