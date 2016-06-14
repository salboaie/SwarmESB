/**
 * Created by ctalmacel on 12/15/15.
 */



var assert       = require('double-check').assert;
var exceptions   = require('double-check').exceptions;



exports.test = function(persistence,typeName,model,onSuccess){
    assert.steps("Test model validation",[
        function(next){

            model.someOtherProperty = {
                type :'string',
                default:'asdfd',
                index:true
            }

            persistence.registerModel(typeName,model,function(err,resultingModel){
                assert.notEqual(err,null);
                next();
            });
        },
        function(next){
            var invalidModel = {};
            delete model.someOtherProperty;
            for(var prop in model){
                invalidModel[prop] = model[prop];
            }

            for(var prop in invalidModel){
                delete invalidModel[prop];
                break;
            }

            persistence.registerModel(typeName,invalidModel,function(err,resultingModel){
                assert.notEqual(err,null);
                next();
            });
        },
        function(next){
            delete model.someOtherProperty;
            persistence.registerModel(typeName,model,function(err,resultingModel){
                assert.equal(err,null);
                onSuccess(next);
            })
        }
    ])
}