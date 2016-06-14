/**
 * Created by ctalmacel on 3/9/16.
 */
var assert = require("double-check").assert;

var why = require("../lib/why.js");

process.env['RUN_WITH_WHYS'] = true;

assert.callback("Test why embeddings", function(end) {

    function caller(){
        callback.why("Motivation1").why("Motivation2").why("Motivation3")();
    }
    function callback(arg1,arg2){
        var executionSummary = why.getGlobalCurrentContext().getExecutionSummary();
        assert.equal(executionSummary.hasOwnProperty("First Call"),true);
        assert.equal(executionSummary["First Call"].calls.hasOwnProperty('Motivation1 AND Motivation2 AND Motivation3'),true);
        end();
    }
    caller.why("First Call")();
})
