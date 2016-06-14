var assert = require("double-check").assert;

var why = require("../lib/why.js");

process.env['RUN_WITH_WHYS'] = true;

function asyncFunction(callback){
    setTimeout(callback, 100);
}


assert.callback("Sync and Async Embeddings", function(end) {

    function caller(){
            asyncFunction.why("Motivation1").why("Motivation2")(callback.why("Callback Motivation1").why("Callback Motivation2"));

    }
    function callback(){
        var executionSummary = why.getGlobalCurrentContext().getExecutionSummary();
        assert.equal(executionSummary.hasOwnProperty("First Call"),true);
        assert.equal(executionSummary["First Call"].calls.hasOwnProperty('Motivation1 AND Motivation2'),true);
        assert.equal(executionSummary["First Call"].calls.hasOwnProperty('Callback Motivation1 AND Callback Motivation2'),true);
        end();
    }
    caller.why("First Call")();
})
