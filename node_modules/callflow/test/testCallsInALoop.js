var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;

function asyncReturnsTrue(callback){
    setTimeout(function(){
        callback(null, true);
    }, 10);
}


process.env['RUN_WITH_WHYS'] = true;
assert.callback("Test calls in a loop", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "callback" +
        "callback" +
        "callback" +
        "end";

    function testResults(){
        assert.equal(logs,expectedLogs,"something went wrong");
        end();
    }

    var f = flow.create("Flow example", {
        begin:function(a1,a2){
            logs+="begin";
            for(var i=0;i<3;i++){
                this.callback.why("callback"+i)(undefined);
            }
        },
        callback:function(a){
            logs += "callback";

        },
        end:{
            join:"callback",
            code:function(){
                logs+="end";
                testResults();
            }
        }
    });
    f();
})



