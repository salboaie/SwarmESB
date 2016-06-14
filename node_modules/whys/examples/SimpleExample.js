/**
 * Created by ctalmacel on 3/9/16.
 */
var assert = require("double-check").assert;

var why = require("../lib/why.js");

process.env['RUN_WITH_WHYS'] = true;
process.env['HIDE_EXECUTION'] = true;


function caller(){
    func1.why("func1 1")();
    func1.why("func1 2")("some arg");
}
function func1(){
    func2.why("func2 1")();
    func2.why("func2 2")("some other arg",5);
}

var count = 0;
function func2(){
    count++;
    if(count===4){
        console.log(JSON.stringify(why.getGlobalCurrentContext().getExecutionSummary(),null,4));
    }
}

caller.why("Start calling")();
