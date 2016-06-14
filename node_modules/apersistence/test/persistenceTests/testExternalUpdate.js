/**
 * Created by ctalmacel on 2/16/16.
 */


var assert       = require('double-check').assert;
var exceptions   = require('double-check').exceptions;


exports.test = function(persistence,typeName,newValues,onSuccess) {

    var testFunctions = [];

    newValues.forEach(function(newValue) {
        testFunctions.push(function(next){
            persistence.lookup(typeName,newValue.id, function (err,dbObject) {
                persistence.externalUpdate(dbObject, newValue);
                for(var prop in newValue){
                    if(dbObject[prop]!=newValue[prop]){
                        assert.fail('Incorrect external update');
                    }
                }
                persistence.save(dbObject, function (err,dbObject) {
                    persistence.lookup(typeName,newValue.id, function (err,savedObject) {
                        for(var prop in savedObject) {
                            if((typeof savedObject[prop] !=='function')&&(prop!='__meta')) {
                                if(savedObject[prop]!==dbObject[prop]) {
                                    assert.fail();
                                }
                            }
                        }
                        next();

                    })
                });
            })
        });
    });


    testFunctions.push(function(next){
        onSuccess(next);
    });

    assert.steps('Test external updates',testFunctions);

}