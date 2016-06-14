/**
 * Created by ctalmacel on 3/10/16.
 */
/**
 * Created by ctalmacel on 3/9/16.
 */
var assert = require("double-check").assert;

var why = require("../lib/why.js");

process.env['RUN_WITH_WHYS'] = true;


assert.callback("Simple synchronous why", function(end) {

    function caller(){
        callback.why("Synchronous call")();

    }
    function callback(arg1,arg2){
        var executionSummary = why.getGlobalCurrentContext().getExecutionSummary();

        assert.equal(executionSummary.hasOwnProperty("First Call"),true);
        assert.equal(executionSummary["First Call"].calls.hasOwnProperty('Synchronous call'),true);
        assert.equal(executionSummary["First Call"].args.length === 0,true);
        end();
    }
    caller.why("First Call")();
})
