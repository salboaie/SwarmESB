/**
 * Created by ctalmacel on 12/21/15.
 */



var assert       = require('double-check').assert;
var exceptions   = require('double-check').exceptions;

exports.test = function(persistence,typeName,validIds,invalidIds,onSuccess) {

    var functions = [];
    validIds.forEach(function (id) {
        functions.push(function (next) {
            persistence.findById(typeName, id, function (err, result) {

                if (err) {
                    throw err;
                }
                assert.notEqual(result,null, "Error for id " + id);
                next();
            })
        });
    });

    invalidIds.forEach(function (invalidId) {
        functions.push(function (next) {
            persistence.findById(typeName,invalidId,function(err,result){
                if(err){
                    throw err;
                }
                assert.isNull(result, "The result should be null since there is no such object in the database");
                next();
            })
        })
    })
    functions.push(function(next){
        onSuccess(next);
    })
    assert.steps("Test findById",functions);
}

