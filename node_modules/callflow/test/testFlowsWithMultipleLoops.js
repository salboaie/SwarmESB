var flow = require("../lib/flow.js");
var assert = require('double-check').assert;

assert.callback("Loop test callback join", function (end) {
    var logs = "";

    var phaseArray1 = ["arr11", "arr12", "arr13", "arr14"];
    var phaseArray2 = ["arr21", "arr22", "arr23", "arr24"];

    var expectedLogs = "begin" +
        "arr21" +
        "arr22" +
        "arr23" +
        "arr24" +
        "arr11" +
        "arr12" +
        "arr13" +
        "arr14" +
        "hotelJoin"+
        "sleep"+
        "end";


    function asyncReturnsTrue(callback, timeout) {
        setTimeout(function () {
            callback(null, true);
        }, timeout);
    }


    function testResults() {
        assert.equal(logs, expectedLogs, "Difference between expected logs and actual results");
        end();
    }

    var loopFlow = flow.create("Loop flow", {

            begin: function () {
                logs += "begin";
                asyncReturnsTrue(this.continue("processNode1"),10);
                asyncReturnsTrue(this.continue("processNode2"),1);
            },

            processNode1: function () {
                var self = this;
                    phaseArray1.forEach(function (phase) {
                        self.processNode(phase);
                    });
            },

            processNode2: function () {
                var self = this;
                phaseArray2.forEach(function (phase) {
                    self.processNode(phase);
                });
            },

            processNode: function (phase) {
                logs += phase;

            },

            waitHere:{
                join: "processNode1,processNode2",
                code:function(){
                    logs += "hotelJoin";
                    asyncReturnsTrue(this.continue("processNode3"),10);
                }
            },

            processNode3:function(){
                logs += "sleep";
            },

            end: {
                join: "processNode3",
                code: function (a) {
                    logs += "end";
                    testResults();
                }
            }

        }
    )
    loopFlow();

})
