/*
    A simple cache implementation that periodically removes everything from cache.
    We purge everything to avoid consuming too much memory in large systems. This should be enough for normal usages.
    For an highly optimised version, ask our commercial offers.
 */

function ExpiringCache(expireTime){
    var storage = {};
    function initilise(space, key){
        if(!storage[space]){
            storage[space] = {};
        }

        if(!storage[space][key]){
            storage[space][key] = {};
        }
    }

    this.insertValue = function(space, key, value){
        initilise(space, key);
        storage[space][key][value] = value;
    }

    this.removeValue = function(space, key, value ){
        initilise(space, key);
        delete storage[space][key][value];
    }


    var err = new Error();
    this.loadAll = function(space, key, callback){
        var arr = [];
        if(!storage[space] || !storage[space][key]){
            callback(err, null);
            return ;
        }

        for(var v in storage[space][key]){
            arr.push(v);
        }
        callback(null, arr);
    }

    function autoClean(){
        storage = {};
        setTimeOut(expireTime,autoClean);
    }

}


exports.createCache = function(expireTime){
    return new ExpiringCache(expireTime);
}