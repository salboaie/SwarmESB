
var flow = require("../lib/flow");
var assert  = require('double-check').assert;
assert.callback("Test calls on different flows", function(end){
    var expected1 = "FLOW1FLOW1FLOW1end";
    var expected2 = "FLOW2FLOW2end";

    var resulting_logs1 = false;
    var resulting_logs2 = false;



  var composeFlow1 = flow.create("FLOW 1", {
          begin:function(expected){
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
                  resulting_logs1 = this.logs;
              }
          }
      });
    var composeFlow2 = flow.create("FLOW 2", {

       begin:function(expected){
           this.logs = "FLOW2";
           this.step("FLOW2");

       },
       step:function(a){
           this.logs += a;
       },
       end:{
           join:"step",
           code:function(){
               this.logs += "end";
               resulting_logs2 = this.logs;
           }
       }
    });

   composeFlow1();
   composeFlow2();


    function runAsserts(){
        setTimeout(function(){
            if(resulting_logs1!==false && resulting_logs2!==false){
                testResults(resulting_logs2,expected2);
                testResults(resulting_logs1,expected1);
            }else{
                runAsserts();
            }
        },100)


        var successes = 0;
        function testResults(logs,expected){
            assert.equal(logs,expected,"Difference between expected logs and actual results");
            if(++successes === 2) {
                end();
            }
        }
    }
    runAsserts();
})



