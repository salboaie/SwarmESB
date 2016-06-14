/**
 * Created by ctalmacel on 12/28/15.
 */
var assert       = require('double-check').assert;
var exceptions   = require('double-check').exceptions;


//this test depends on testFindById.js to work properly

exports.test = function(persistence,objects,onSuccess){
     var testFunctions = [];

    var auxObject ;
    //shuffle the values a bit
    objects.some(function(object,index) {
        if (index % 2 == 0 && index < objects.length - 1) {
            var pkField = object.__meta.getPKField();

            for(var field in object){
                var value = object[field];
                if(field === pkField){
                    continue;
                }
                if(typeof value === 'function'){
                    continue;
                }
                if(value === object.__meta){
                    continue;
                }

                object[field] = objects[index+1][field];
                objects[index+1][field] = value;

            }
        }
        else {
            if (index == objects.length - 1)
                return true;
            else
                return false;
        }
    });

    objects.forEach(function(object){

        testFunctions.push(function(next){
            persistence.saveObject(object,function(err,result){
                if(err){
                    console.error(error);
                }
                else {
                    object = result;
                    next();
                }
            })
        })

        testFunctions.push(function(next){
            persistence.findById(object.__meta.typeName,object.__meta.getPK(),function(err,result){

                assert.isNull(err,"Error "+err+" appeared while testing that object was saved");
                assert.objectHasFields(result.__meta.savedValues,object.__meta.savedValues,'Object with id '+object.__meta.getPK()+' was not saved properly');
                next();
            })
        })

    })

     testFunctions.push(function(next){
        onSuccess(next);
     })
    assert.steps("Test updateObject",testFunctions);
}

