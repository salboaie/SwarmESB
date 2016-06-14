/**
 * Created by ctalmacel on 12/21/15.
 */



var assert       = require('double-check').assert;
var exceptions   = require('double-check').exceptions;



exports.test = function(persistence,filterTests,onSuccess){
    var testFunctions = [];

    filterTests.forEach(function(filterTest) {
        testFunctions.push(function (next) {
            persistence.filter(filterTest.modelName, filterTest.filter, function (err, results) {
                if(err){
                    throw(err);
                }
                assert.arraysMatch(results,filterTest.expectedResults,'Filter test '+filterTest+" did not produce the expected output");
                next();
            })
        })
    });

    testFunctions.push(function(next){
        onSuccess(next);
    })

    assert.steps("Test filter",testFunctions);
}




