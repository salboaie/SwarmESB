var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

function asyncReturnsTrue(callback){
    setTimeout(function(){
        callback(null, true);
    }, 10);
}



assert.callback("Test simple callback call", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "callback";

    function testResults(){
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        end();
    }

    var f = flow.create("Flow example", {
        begin:function(a1,a2){
            logs+="begin";
            asyncReturnsTrue(this.continue("callback"));
        },
        callback:function(a){
            logs += "callback";
            testResults();
        }
    });
    f();
})



