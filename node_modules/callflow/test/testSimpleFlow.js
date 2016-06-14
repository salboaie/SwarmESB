var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;
assert.callback("Simple test callback flow", function(end){
    var logs = "";
    var expectedLogs = "begin" +
                       "step";

    function testResults(){
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        end();
    }

    var f = flow.create("Flow example", {
        begin:function(a1){
            logs+="begin";
            this.step();
        },
        step:function(a){
            logs += "step";
            testResults();
        }
    });
    f("someArgs");
})



