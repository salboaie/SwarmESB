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

MemoryPersistenceStrategy.prototype = require("../lib/BasicStrategy.js").createBasicStrategy();

function AbstractPersistence(persistenceStrategy){

    this.persistenceStrategy = persistenceStrategy;

    this.lookup = function(typeName, id, callback){
        persistenceStrategy.getObject(typeName, id, callback);
    }

    this.findById = function(typeName, id, callback){
        persistenceStrategy.findById(typeName, id, callback);
    }

    this.saveObject = function(obj, diff){
        var typeName = obj.__meta.typeName;
        var pk = obj.__meta.getPK();

        var valueDiff = [];
        diff.forEach(function(i){
            valueDiff.push( modelUtil.serialiseField(obj, i, persistenceStrategy));
        })
        if(!pk){
            throw new Error("Failing to save object with null pk:" + JSON.stringify(obj));
        }
        persistenceStrategy.updateFields(typeName, pk, diff, valueDiff, obj);
    }

    this.executeFilter = function(typeName, filter, callback){
        persistenceStrategy.filter(typeName, filter, function(err,res){
            /*if(res){
                res.forEach(function(o){
                    modelUtil.load(o, o, persistenceStrategy);
                })
            }*/
            callback(err, res);
        });
    }

    this.filter = function(typeName, filter, callback){
        var persistence = persistenceRegistry[typeName];
        persistence.executeFilter(typeName, filter, callback);
    }

    this.query = function(typeName, query, callback){
        if(persistenceStrategy.query){
            persistenceStrategy.query(typeName, query,callback);
        }
    }


    this.save = function(obj, callback){
        var persistence = persistenceRegistry[obj.__meta.typeName];

        var diff = modelUtil.changesDiff(obj);
        persistence.saveObject(obj, diff);
        modelUtil.load(obj, obj, persistenceStrategy);
        if(callback){
            callback(null,diff);
        }
    }

    this.isFresh = function(obj){
        return obj.__meta.freshRawObject;
    }

    this.externalUpdate = function(obj, newValues){
        modelUtil.load(obj, newValues, persistenceStrategy);
    }

}

var persistenceRegistry = {}; /* allow multiple persistences to coexist in the same environment*/

AbstractPersistence.prototype.registerModel = function(typeName, description, strategy){
    persistenceRegistry[typeName] = this;
    modelUtil.registerModel(typeName, description, strategy);
}

AbstractPersistence.prototype.lookup = function(typeName, id, callback){
    var persistence = persistenceRegistry[typeName];
    persistence.lookup(typeName, id, callback);
}

AbstractPersistence.prototype.delete = function(obj ){
    var typeName = obj.__meta.typeName;
    var objId = obj.__meta.getPK();
    var persistence = persistenceRegistry[typeName];
    persistence.persistenceStrategy.deleteObject(typeName, objId);
}

AbstractPersistence.prototype.deleteById = function(typeName, id){
    var persistence = persistenceRegistry[typeName];
    persistence.persistenceStrategy.deleteObject(typeName, id);
}




var basicTypesForJson = require('./basicJSONTypes.js');

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


exports.getStrategyForModelName = function(modelName){
    return startegies[modelName].getStrategy();
}

var waiters = {};
function getWaiter(typeName){
    var ret = waiters[typeName];
    if(!ret){
        ret = waiters[typeName] = require("./SingletonWaiter.js").create();
    }
    return ret;
}


var startegiesForPersystence = {};
var persistences = {};


exports.registerModel = function(modelName, persistenceType, description){
    var waiter = getWaiter(persistenceType);
    waiter.gCall(function(){
        var strategy       = startegiesForPersystence[persistenceType];
        var persistence    = persistences[persistenceType];
        if(!strategy || ! persistence){
            throw (new Error("Can't register model " + modelName + "'with persistence type ", persistenceType));
        }
        persistence.registerModel(modelName, description, strategy);
    })
}


exports.createRedisPersistence = function(redisConnection){
    var REDIS_PERSISTENCE_TYPE = "Redis";
    var strategy = require("../db/RedisPersistence.js").createRedisStrategy(redisConnection);
    startegiesForPersystence[REDIS_PERSISTENCE_TYPE] = strategy;
    var pers = new AbstractPersistence(strategy);
    pers = async.bindAllMembers(pers);

    persistences[REDIS_PERSISTENCE_TYPE] = pers;
    basicTypesForJson.registerTypeConverters(strategy);
    var waiter = getWaiter(REDIS_PERSISTENCE_TYPE);
    waiter.setSingleton(pers);
    return pers;
}

