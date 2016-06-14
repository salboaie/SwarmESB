
var async = require("asynchron");
var assert       = require('double-check').assert;
var exceptions   = require('double-check').exceptions;
var apersistence = require("../lib/abstractPersistence.js");
var redis = require("redis");
var modelUtil = require ("../lib/ModelDescription");


var redisConnection = async.bindAllMembers(redis.createClient());
var persistence = apersistence.createRedisPersistence(redisConnection);



var rawData = [
    {id: "2", name: "Dana", location: "Tecuci",sex:true},
    {id: "3", name: "Ana", location: "Iasi",sex:false},
    {id: "4", name: "Ana", location: "Bucuresti",sex:true},
    {id: "5", name: "Ion", location: "Iasi",sex:false}];
var model = {
    id: {
        type:'int',
        default:"no name",
        pk:true
    },
    name: {
        type:'string',
        default:0,
        index:true
    },
    location: {
        type:'string',
        default:true
    },
    sex: {
        type:'boolean',
        default:true
    }
};
var modelName = "Testy";
var objects;

var testFindById = require('./persistenceTests/testFindById').test;
var testFilter = require('./persistenceTests/testFilter').test;
var testDeleteById = require('./persistenceTests/testDeleteById').test;
var testSaveNewObject = require('./persistenceTests/testSaveNewObject').test;
var testUpdateObject = require('./persistenceTests/testUpdateObject').test;
var testExternalUpdate = require('./persistenceTests/testExternalUpdate').test;

assert.steps("Redis test suite",[
    function(next){
        persistence.registerModel(modelName,model,function(){
                redisConnection.flushdb(function(){
                    next();
                })
        })
    },
    function(next){
        objects = rawData.map(function(data){
            return modelUtil.createObjectFromData(modelName,data);
        });

        testSaveNewObject(persistence,objects,function(testWasSuccessful){
            testWasSuccessful();
            next();
        })
    },
    function(next){

        var invalidIds = [7,10];
        var ids = rawData.map(function(object){
            return object.id;
        })

        testFindById(persistence,modelName,ids,invalidIds,function(testWasSuccessful){
            testWasSuccessful();
            next();
        });
    },
    function(next){
        var filterTests = [
            {
                modelName:modelName,
                filter:{name:"Ana"},
                expectedResults: [{id: "4", name: "Ana", location: "Bucuresti",sex:true},
                                    {id: "3", name: "Ana", location: "Iasi",sex:false}]}
        ];

        testFilter(persistence,filterTests,function(testWasSuccessfull){
            testWasSuccessfull();
            next();
        })
    },
    function(next){

        testUpdateObject(persistence,objects,function(testWasSuccessful){
            testWasSuccessful();
            next();
        })
    },
    function(next){
        testExternalUpdate(persistence,modelName,[{id:"4",location:"NotBucuresti"}],function(testWasSuccessfull){
            testWasSuccessfull();
            next();
        })
    },
    function(next){
        var ids = rawData.map(function(tableEntry){
            return tableEntry.id;
        });

        testDeleteById(persistence,modelName,ids,function(testWasSuccessfull){
            testWasSuccessfull();
            next();
        })

    },
    function(next){
        redisConnection.flushdb(function(){
            redisConnection.quit();
            next();
        });

    }

])




