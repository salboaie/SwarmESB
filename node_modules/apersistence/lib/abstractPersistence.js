/*
   Abstraction for doing simple CRUD operations over Redis or SQl databases

   APIs:

    persistence.lookup("typeName", id) -> object
    persistence.save(object)
    persistence.loadAll("typeName")


    Ensures:
    - minimal database hits (discover changes in objects)
    - minimise concurrency issues
    - can use a cache
    - declare field types, can initialise and check types before saving

*/

var modelUtil = require("./ModelDescription.js");
var async = require("asynchron");

function MemoryPersistenceStrategy(){
    var persistence = {};

    function getInternal(typeName, id){
        var p = persistence[typeName];
        if(!p){
            persistence[typeName] = p = {};
        }
        var o = p[id];
        if(!o){
            p[id] = o = modelUtil.createRaw(typeName, id);
        }
        return o;
    }

    this.getObject = function(typeName, id, callback){
        var o = getInternal(typeName, id);
        callback(null, o);
    }

    this.updateFields =  function(type, id, fields, values){
        var o = getInternal(type, id);
        for(var i= 0, len=fields.length;i<len; i++){
            o[fields[i]] = values[i];
        }
    }

    this.deleteObject = function(type, id){
        console.log("MemoryPersistenceStrategy:Delete object not implemented");
    }

    this.filter = function(type, filter,  callback){
        console.log("MemoryPersistenceStrategy: Get all not implemented");
    }

    this.query = function(type, query, callback){
        console.log("MemoryPersistenceStrategy: Query not implemented");
    }
}

MemoryPersistenceStrategy.prototype = require("./BasicStrategy.js").createBasicStrategy();

function AbstractPersistence(persistenceStrategy){

    var self = this;
    this.persistenceStrategy = persistenceStrategy;

    this.lookup = function(typeName, id, callback){
        var serialized_id = modelUtil.serialiseField(typeName,modelUtil.getPKField(typeName),id,self.persistenceStrategy);
        persistenceStrategy.getObject(typeName, serialized_id, callback);
    }

    this.findById = function(typeName, id, callback){
        var serialized_id = modelUtil.serialiseField(typeName,modelUtil.getPKField(typeName),id,self.persistenceStrategy);
        persistenceStrategy.findById(typeName, serialized_id, callback);
    }

    this.saveFields = function(obj, fields, callback){

        if(fields === undefined){
            fields = modelUtil.changesDiff(obj);
        }

        if(fields.length === 0){
            return callback(null,obj);
        }

        var valueDiff = [];
        fields.forEach(function(field){
            valueDiff.push( modelUtil.serialiseField(obj.__meta.typeName,field,obj[field], persistenceStrategy));
        })

        var pk = obj.__meta.getPK();
        if(!pk){
            throw new Error("Failing to save object with null pk:" + JSON.stringify(obj));
        }
        persistenceStrategy.updateFields(obj, fields, valueDiff,function(err,result){
            if(err){
                callback(err);
            }
            else{
                fields.forEach(function(field){
                    obj.__meta.savedValues[field] = obj[field];
                })
                callback(err,obj);
            }
        });
    }

    this.saveObject = function(obj,callback){
        self.saveFields(obj,undefined,callback);
    }

    this.save = this.saveObject;

    this.filter = function(typeName, filter, callback){
        for(var field in filter){
            filter[field] = modelUtil.serialiseField(typeName,field,filter[field],persistenceStrategy);
        }
        persistenceStrategy.filter(typeName, filter, callback);
    }

    this.query = function(typeName, query, callback){
        if(persistenceStrategy.query){
            persistenceStrategy.query(typeName, query,callback);
        }
    }

    this.isFresh = function(obj){
        return obj.__meta.freshRawObject;
    }

    this.externalUpdate = function(obj, newValues){
        modelUtil.updateObject(obj,newValues,self.persistenceStrategy);
    }

    this.registerModel = function(typeName,model,callback){
        var self = this;

        if(this.persistenceStrategy.validateModel === undefined) {
            if(persistenceRegistry[typeName] === undefined)
                persistenceRegistry[typeName] = [];
            persistenceRegistry[typeName].push(this.persistenceStrategy);

            callback(null,modelUtil.registerModel(typeName, model, this.persistenceStrategy));
        }
        else {
            this.persistenceStrategy.validateModel(typeName, model, function (err, isValid) {
                if (err) {
                    callback(err);
                    return;
                }

                if (isValid === false) {
                    callback(new Error("Invalid model"));
                    return;
                }

                if(persistenceRegistry[typeName] === undefined)
                    persistenceRegistry[typeName] = [];
                persistenceRegistry[typeName].push(this.persistenceStrategy);
                callback(null, modelUtil.registerModel(typeName, model, self.persistenceStrategy));
            });
        }
    }

    this.delete = function(obj,callback){
        this.deleteById(obj.__meta.typeName,obj.__meta.getPK(),callback);
    }

    this.deleteById = function(typeName,id,callback){
        var field = modelUtil.getPKField(typeName);
        var serialized_id = modelUtil.serialiseField(typeName,field,id,self.persistenceStrategy);
        this.persistenceStrategy.deleteObject(typeName,id,callback);
    }
}



var basicTypesForJson = require('./basicJSONTypes.js');
var basicTypesForSQL  = require('./basicSQLTypes.js');


exports.createMemoryPersistence = function(){
    var strategy = new MemoryPersistenceStrategy();
    basicTypesForJson.registerTypeConverters(strategy);
    var pers = new AbstractPersistence(strategy);
    pers = async.bindAllMembers(pers);
    return pers;
}

exports.createPersistence = function(strategy){
    var pers = new AbstractPersistence(strategy);
    pers = async.bindAllMembers(pers);
    return pers;
}

exports.createRawObject = function(typeName, pk){
    return modelUtil.createRaw(typeName, pk);
}

var persistenceRegistry = {}; /* allow multiple persistences to coexist in the same environment*/
exports.getPersistencesForType = function(typeName){
    return persistenceRegistry[typeName];
}

var waiters = {};
function getWaiter(typeName){
    var ret = waiters[typeName];
    if(!ret){
        ret = waiters[typeName] = require("./SingletonWaiter.js").create();
    }
    return ret;
}



var persistences = {};
exports.registerModel = function(modelName, persistenceType, description,callback){
    var waiter = getWaiter(persistenceType);
    waiter.gCall(function(){
        var persistence    = persistences[persistenceType];
        if(! persistence){
            throw (new Error(persistenceType+" not registered "));
        }
        persistence.registerModel(modelName, description, callback);
    })
}

exports.createRedisPersistence = function(redisConnection){
    var REDIS_PERSISTENCE_TYPE = "Redis";
    var strategy = require("../db/RedisPersistence.js").createRedisStrategy(redisConnection);
    var pers = new AbstractPersistence(strategy);
    pers = async.bindAllMembers(pers);

    persistences[REDIS_PERSISTENCE_TYPE] = pers;
    basicTypesForJson.registerTypeConverters(strategy);
    var waiter = getWaiter(REDIS_PERSISTENCE_TYPE);
    waiter.setSingleton(pers);
    return pers;
};


exports.createMySqlPersistence = function(mysqlConnection){

    var MYSQL_PERSISTENCE_TYPE = "MySQL";
    var strategy = require("../db/sql/MySqlPersistence.js").createMySqlStrategy(mysqlConnection);
    var pers = new AbstractPersistence(strategy);
    pers = async.bindAllMembers(pers);
    pers.mysqlUtils = require('../db/sql/mysqlUtils.js');
    persistences[MYSQL_PERSISTENCE_TYPE] = pers;
    basicTypesForSQL.registerTypeConverters(strategy);
    var waiter = getWaiter(MYSQL_PERSISTENCE_TYPE);
    waiter.setSingleton(pers);
    return pers;
}

exports.modelUtilities = modelUtil;