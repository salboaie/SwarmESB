var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;


function asyncReturnsTrue(callback){
    setTimeout(function(){
        callback(null, true);
    }, 10);
}

assert.callback("Test statuses", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "step" +
        "step"+
        "end";

    var expectedStatuses = "created"+
            "running"+
            "running"+
            "running"+
            "running"+
            "done";

    var statuses = "";
    function testResults(){
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        setTimeout(function(){
            statuses+=x.getStatus();
            assert.equal(statuses,expectedStatuses,"Difference between expected statuses and actual statuses");
            end();
        },10)
    }

    var f = flow.create("Test statuses", {
        begin:function(){
            logs+="begin";
            statuses+=this.getStatus();
            this.step();
            asyncReturnsTrue(this.continue("step"));
        },
        step:function(){
            statuses+=this.getStatus();
            logs += "step";
        },
        end:{
            join:"step",
            code:function(a){
                statuses+=this.getStatus();
                logs += "end";
                testResults();
            }
        }
    });
    statuses+= "created";
    var x = f();
})



