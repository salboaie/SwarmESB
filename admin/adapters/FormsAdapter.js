/**
 * Created by ciprian on 4/20/17.
 */



var core = require("swarmcore");
thisAdapter = core.createAdapter("FormsAdapter");
var persistence = undefined;
var container = require('safebox').container;
var uuid = require('node-uuid');
var apersistence = require('apersistence');

container.declareDependency('formsAdapter',['mysqlPersistence'],function(outOfService,mysqlPersistence) {
    if (!outOfService) {
        persistence = mysqlPersistence;
        var models = [{
            modelName: "Form",
            structure: {
                formId:{
                    type: "string",
                    length: 255,
                    pk:true
                },
                name: {
                    type: "string",
                    length: 255
                },
                zone: {
                    type: "string",
                    length: 255
                },
                structure: {
                    type: "JSON"
                }
            }
        },{
            modelName: "Answer",
            structure: {
                id:{
                    type: "string",
                    length: 255,
                    pk:true
                },
                user: {
                    type: "string",
                    length: 255
                },
                form: {
                    type: "string",
                    length: 255
                },
                answer: {
                    type: "JSON"
                }
            }
        }];

        models.forEach(function (model) {
            persistence.registerModel(model.modelName, model.structure, function (err, result) {
                if (err) {
                    console.log(err);
                }
            })
        })
    }
});

submitForm = function(form,callback){
    persistence.filter("Form",{"name":form.name,"zone":form.zone},function(err,result){
        if(err){
            callback(err)
        }else {
            var dbForm = undefined;
            var dbId = undefined;
            if (result.length === 0) {
                dbForm = apersistence.createRawObject("Form", uuid.v1());
                dbId = dbForm.formId;
            } else {
                dbForm = result[0]
            }

            persistence.externalUpdate(dbForm,form);
            dbForm.formId = dbId; //so that it does not take the id of 'form'
            persistence.save(dbForm,callback);
        }
    })
};

submitAnswer = function(answer,form,user,callback){
    persistence.filter("Answer",{"form":form,"user":user},function(err,result){
        if(err){
            callback(err)
        }else {
            var dbAnswer = undefined;
            if (result.length === 0) {
                dbAnswer = apersistence.createRawObject("Answer", uuid.v1());
                dbAnswer.form = form;
                dbAnswer.user = user;
            } else {
                dbAnswer = result[0]
            }
            dbAnswer.answer = answer;
            persistence.save(dbAnswer, callback);
        }
    })
}

retrieveForms = function(filter,callback){
    persistence.filter("Form",filter,callback);
}

retrieveAnswers = function(filter,callback){
    persistence.filter('Answer',filter,callback)
}
