
var flow = require("../lib/flow");
var assert       = require('double-check').assert;

assert.callback("Test multiple calls on the same flow", function(end){
    var expected1 = "FLOW1FLOW1FLOW1end";

    var successes = 0;
    function testResults(logs,expected){
        assert.equal(logs,expected,"Difference between expected logs and actual results");
        if(++successes === 2) {
            end();
        }
    }

    var fl = flow.create("FLOW 1", {
        begin:function(expected,start){
            this.logs=start;
            this.expected = start+expected;
            this.logs = "FLOW1";
            this.step("FLOW1");
            this.next("step",undefined,"FLOW1")
        },
        step:function(a){
            this.logs +=a
        },
        end:{
            join:"step",
            code:function(){
                this.logs += "end";
                testResults(this.logs,expected1);
            }
        }
    });


    fl(expected1,"first");
    fl(expected1,"second");

})



