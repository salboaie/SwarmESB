/**
 * Created by salboaie on 4/23/15.
 */

var assert       = require('double-check').assert;
var exceptions   = require('double-check').exceptions;

exceptions.register("emptyString", function(explanation){
    if(explanation){
        throw new Error("EmptyString exception. Explanation: " + explanation);
    } else {
        throw new Error("EmptyString exception");
    }
})

assert.addCheck("emptyString", function(str, explanation){
    if(!(str == null || str == undefined || str == '')){
        exceptions.emptyString(explanation);
    }
})

assert.fail("Expect test failure on emptyString('abcd')", function(){
    assert.emptyString("abcd", "Is not empty");
})

assert.pass("Expect success on normal empty strings", function(){
    assert.emptyString("", "Really empty");
    assert.emptyString(null, "Null string");
    assert.emptyString(undefined, "undefined string");
})

var a = "abcd";

assert.pass("Test equal", function(){
    assert.equal(a, "abcd");
})


function asyncFunc(callback){
    setTimeout(callback, 100);
}


assert.callback("Expect callback call", function(callback){
    asyncFunc(function(){
        callback();
    })
})


assert.steps("Expect 3 steps test",
        [
            function(nextStep) {
                asyncFunc(function () {
                    nextStep();
                })
            },
            asyncFunc,
            asyncFunc
        ]);

function fail(){
    assert.emptyString("a non empty string", "Non empty string given to get a failed result");
}


assert.steps("Expect failed test on step 2",
    [
        asyncFunc,
        fail,
        asyncFunc
    ]);


