
/*
        generic persistence for ACLs. Provide insert, remove and loadSet functions to create a persistence for other databases
*/

function GenericPersistence(cache, insertFunc, removeFunc, loadSet){

    function insertValue(space, key, value){
        cache.insertValue(space, key, value);
        if(insertFunc){
            insertFunc(space, key, value);
        }
    }

    function removeValue (space, key, value){
        cache.removeValue(space, key, value);
        if(removeFunc){
            removeFunc(space, key, value);
        }
    }


    function loadAll (space, key, callback){
        cache.loadAll(space, key, function(err, res){
            if(err){
                if(loadSet) {
                    loadSet(space, key, callback);
                }
            } else {
                callback(null,res);
            }
        });
    }

    this.addResourceParent = function(resourcesUID, parentUID){
        insertValue("resources", resourcesUID, parentUID);
    }

    this.addZoneParent = function(zoneId, parentZoneId){
        insertValue("zones", zoneId, parentZoneId);
    }

    this.delResourceParent = function(resourcesUID, parentUID){
        removeValue("resources", resourcesUID, parentUID);
    }

    this.delZoneParent = function(zoneId, parentZoneId){
        removeValue("zones", zoneId, parentZoneId);
    }

    this.loadZoneParents = function(zoneId, callback){
        var resObj = {};
        var waitingCounter = 0;
        var self = this;

        var mkResArray = function(){
            var res = [zoneId];
            for(var v in resObj){
                res.push(v);
            }
            return res;
        }

        function loadOneLevel(zoneId){
            waitingCounter++;
            loadAll("zones", zoneId, function(err, arr){
                arr.map(function(i){
                    resObj[i] = i;
                    loadOneLevel(i);
                })
                waitingCounter--;
                if(0 == waitingCounter){
                    callback(null, mkResArray());
                }
            });
        }

        loadOneLevel(zoneId);

    }

    this.grant = function(concernName,zoneId, resourceId){
        insertValue(concernName, resourceId,zoneId);
    }

    this.ungrant = function(concernName,zoneId, resourceId){
        removeValue(concernName, resourceId, zoneId);
    }


    this.loadResourceDirectParents = function(resourceId, callback){
        loadAll("resources", resourceId, callback);
    }


    this.loadResourceDirectGrants = function(concern, resourceId, callback){
        loadAll(concern, resourceId, callback);
    }


    this.getProperty = function(propertyName, callback){
        var props = loadAll.nasync("acl-properties", propertyName);
        (function(props){
            if(props){
                var value = props[propertyName];
                callback(null, value);
            } else {
                callback(null, false);
            }
        }).wait(props)
    }

    this.setProperty = function(propertyName, value){
        insertValue("acl-properties", propertyName ,value);
    }
}



/*
 Dummy cache with no expiration or other behaviour
 */


function NoExpireCache(){
    var storage = {};
    function initialise(space, key){
        if(!storage[space]){
            storage[space] = {};
        }

        if(!storage[space][key]){
            storage[space][key] = {};
        }
    }

    this.insertValue = function(space, key, value){
        initialise(space, key);
        storage[space][key][value] = value;
    }

    this.removeValue = function(space, key, value ){
        initialise(space, key);
        delete storage[space][key][value];
    }


    this.loadAll = function(space, key, callback){
        var arr = [];
        initialise(space, key);
        for(var v in storage[space][key]){
            arr.push(v);
        }
        callback(null, arr);
    }
}


exports.createRedisPersistence = function(redisConnection, cache){
    if(!cache){
        cache = new NoExpireCache();
    }
    function mkKey(space, key){
        return "acl_magic:" + space + ":" + key;
    }

    return new GenericPersistence(cache,
        function(space, key, value){
            redisConnection.sadd(mkKey(space,key),value);
        },
        function(space, key, value){
            redisConnection.srem(mkKey(space,key),value);
        },
        function(space, key, callback){
            redisConnection.smembers(mkKey(space,key), callback);
        }
    );
}


exports.createMemoryPersistence = function(){
    return new GenericPersistence(new NoExpireCache());
}



