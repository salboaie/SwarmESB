var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;
var why = require("../../whys/lib/why.js");


process.env['RUN_WITH_WHYS'] = true;
assert.callback("Simple flow with callback test", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "step";

    function testResults(context){
        var executionSummary = context.getExecutionSummary();
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        assert.equal(executionSummary.hasOwnProperty('***Starting flow: Flow'),true,"The execution summary does not provide the starting point");
        assert.equal(executionSummary['***Starting flow: Flow'].calls.hasOwnProperty('run step'),true,"The execution summary does not contain call: begin to step");
        end();
    }

    var f = flow.create("Flow", {
        begin:function(a1,a2){
            logs+="begin";
            setTimeout(this.continue("step","run step"),10);
        },
        step:function(a){
            logs += "step";
            var context = why.getGlobalCurrentContext();
            setTimeout(function(){testResults(context)},10);
        }
    });
    f();
})



