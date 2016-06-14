/**
 * Created by ctalmacel on 12/28/15.
 */
var assert       = require('double-check').assert;
var exceptions   = require('double-check').exceptions;


//this test depends on testFindById.js to work properly

exports.test = function(persistence,objects,onSuccess){
     var testFunctions = [];
     objects.forEach(function(objectToBeSaved){
         testFunctions.push(function(next){
             persistence.saveObject(objectToBeSaved,function(err,result) {
                if(err){
                    console.log(err);
                    console.log(err.stack);
                }
                 else {
                    objectToBeSaved = result;
                    next();
                }
             });
         });

         testFunctions.push(function(next){
             persistence.findById(objectToBeSaved.__meta.typeName,objectToBeSaved.__meta.getPK(),function(err,result){

                 assert.isNull(err,"Error "+err+" appeared while testing that object was saved");
                 assert.objectHasFields(result.__meta.savedValues,objectToBeSaved.__meta.savedValues,'Object with id '+objectToBeSaved.__meta.getPK()+' was not saved properly');
                next();
             })
         })
     });
     testFunctions.push(function(next){
        onSuccess(next);
     })
    assert.steps("Test saveNewObject",testFunctions);
}

