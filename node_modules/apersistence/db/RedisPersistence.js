
function objectToArray(o){
    var res = [];
    for(var v in o){
        res.push(o[v]);
    }
    return res;
}
var createRawObject = require("../lib/abstractPersistence.js").createRawObject;
var modelUtil = require("../lib/ModelDescription.js");
var q = require('q');

function RedisPersistenceStrategy(redisConnection){

    var ALL_INDEX = "specialIndex";
    var self = this;

    function mkKey(typeName){
        return "IndexSpace:" + typeName + ":" + ALL_INDEX + ":" + "all";
    }

    function mkIndexKey(typeName, indexName, value){
        return "IndexSpace:" + typeName + ":" + indexName + ":" + value;
    }

    this.getObject = function(typeName, id, callback){
        var obj = redisConnection.hget.jasync(mkKey(typeName), id);
        (function(obj){

            var retObj = createRawObject(typeName, id);
            if(obj){
                modelUtil.load(retObj, obj, self);
            }
            self.cache[id] = retObj;
            callback(null, retObj);
        }).wait(obj);
    }

    this.findById = function(typeName, id, callback){
        this.getObject(typeName, id, function(err, o){
            if(self.isFresh(o)){
                callback(null, null);
            } else {
                callback(null, o);
            }
        });
    }

    this.updateFields =  function(obj,  fields, values, callback){
        var id = obj.__meta.getPK();
        var typeName = obj.__meta.typeName;

        deleteFromIndexes(typeName, id, obj, function(err,res) {
            if(err){
                callback(err);
            }
            else {
                obj.__meta.savedValues = {};

                fields.forEach(function(field,index){obj[field] = values[index];});

                updateAllIndexes(typeName, obj, function(err,result){
                    if(err) callback(err);
                    else {
                        obj.__meta.savedValues = modelUtil.getInnerValues(obj,self);
                        callback(null, obj);
                    }
                });
            }
        });
    }

    this.deleteObject = function(typeName, id,callback){
        if(this.cache.hasOwnProperty(id)) {
            deleteFromIndexes(typeName, id, self.cache[id], function(err,result){
                delete self.cache[id];
                delete result.__meta.savedValues;
                callback(err,result);
            });
        }
        else{
            this.getObject(typeName,id,function(err,obj){
                if(err){
                    callback(err,null);
                }else {
                    deleteFromIndexes(typeName,id,obj,function(err,result){
                        delete self.cache[id];
                        delete result.__meta.savedValues;
                        callback(err,result);
                    });
                }
            })
        }
    }

    function filterArray(typeName, arr, filter, callback){
        var res = [];
        arr.forEach(function(o){
            for(var k in filter){
                if(o[k] != filter[k]) return;
            }
            var retObj = createRawObject(typeName);
            modelUtil.load(retObj, o, self);
            res.push(retObj);
        });
        callback(null, res);
    }

    function returnIndexPart(typeName, indexName, value, callback){
        var idxKey = mkIndexKey(typeName, indexName, value);

        var ret = redisConnection.hgetall.async(idxKey);
        (function(ret){
            var arr = [];
            for(var v in ret){
                arr.push(JSON.parse(ret[v]));
            }
            callback(null, arr);
        }).wait(ret);
    }

    function updateAllIndexes(typeName, obj,callback){
        var indexes      = modelUtil.getIndexes(typeName);
        var pkValue      = obj.__meta.getPK();
        var innerVal = modelUtil.getInnerValues(obj,self);
        var serInnerVal = modelUtil.serialiseObjectValues(typeName,innerVal,self);
        var stringValue = JSON.stringify(serInnerVal);
        var updatesReady = [];
        var qHset = q.nbind(redisConnection.hset,redisConnection);
        indexes.forEach(function(i){
            var idxKey = mkIndexKey(typeName, i, obj[i]);
            updatesReady.push(qHset(idxKey, pkValue, stringValue));
        })

        var idxKey = mkKey(typeName);
        updatesReady.push(qHset(idxKey, pkValue, stringValue));

        q.all(updatesReady).
        then(function(){callback(null,obj);}).
        catch(callback)
    }

    function deleteFromIndexes(typeName, id, obj, callback){
        var indexes      = modelUtil.getIndexes(typeName);
        var pkValue      = id;

        function cleanAll(obj,callback){

            var qHdel = q.nbind(redisConnection.hdel,redisConnection);
            var deletionsReady = [];
            indexes.map(function(i){
                var idxKey = mkIndexKey(typeName, i, obj[i]);
                deletionsReady.push(qHdel(idxKey, pkValue));
            });

            var idxKey = mkKey(typeName);
            deletionsReady.push(qHdel(idxKey, pkValue));

            q.all(deletionsReady).
            then(function(res){callback(null,obj);}).
            catch(callback);
        }

        if(obj === undefined){
            obj = self.getObject.async(typeName, id);
            (function(obj){
                cleanAll(obj,callback);
            }).wait(obj)
        } else {
            cleanAll(obj,callback);
        }
    }

    function returnAllObjects(typeName, callback){
        returnIndexPart(typeName, "specialIndex", "all", callback);
    }

    this.filter = function(typeName, filter, callback){
        var indexes = modelUtil.getIndexes(typeName);
        var foundIndex = null;

        if(!filter){
            returnAllObjects(typeName, callback);
            return ;
        }

        for(var k in filter){
            if(indexes.indexOf(k) !=-1){
                foundIndex = k;
                break;
            }
        }
        if(foundIndex){
            returnIndexPart(typeName, foundIndex, filter[foundIndex], function(err,res){
                filterArray(typeName, res, filter, callback);
            });
        } else {
            callback(new Error("Please add at least one index in your model to match at least one criteria from this filter:" + JSON.stringify(filter)));
        }
    }

    this.query = function(type, query,callback){
        console.log("RedisPersistenceStrategy: Query not implemented");
        callback();
    }

}

RedisPersistenceStrategy.prototype = require("../lib/BasicStrategy.js").createBasicStrategy();


exports.createRedisStrategy = function(redisConnection){
    return new RedisPersistenceStrategy(redisConnection);
}
