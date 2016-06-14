var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

function createDefaultMotivation(){

}

process.env['RUN_WITH_WHYS'] = true;
assert.callback("Simple test callback join", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "step1" +
        "step2" +
        "end";

    function testResults(){
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        end();
    }

    var f = flow.create("Flow example", {
        begin:function(a1,a2){
            logs+="begin";
            this.step1();
            this.step2();
        },
        step1:function(a){
            logs += "step1";

        },
        step2:function(a){
            logs += "step2";
        },
        end:{
            join:"step1,step2",
            code:function(a){
                logs += "end";
                testResults();
            }
        }
    });
    var fl = f();
})



