/**********************************************************************************************
 * Init
 **********************************************************************************************/
thisAdaptor = require('swarmutil').createAdapter("PersistenceCache");


/**********************************************************************************************
 * Const
 **********************************************************************************************/
var CACHE_TIMEOUT = 45;//seconds


/**********************************************************************************************
 * Vars
 **********************************************************************************************/
var cache = {};


/**********************************************************************************************
 * Functions
 **********************************************************************************************/
invalidate = function (key) {
    cache[key] = {data: null, invalidate: true, time: new Date()};
}


search = function (key) {
    var value = cache[key];
    if (!value || value.data === null || value.invalidate === true || isExpired(value.time)) {
        return null;
    }
    return value.data;
}


update = function (key, data) {
    var oldValue = search(key);
    if (!oldValue || (oldValue && oldValue.time < data.time)) {
        cache[key] = {data: data, invalidate: false, time: new Date()};
    }
    return cache[key];
}


getKey = function (className, id) {
    return className + "_" + id;
}


function isExpired(time) {
    var currentTime = new Date();
    if (currentTime.time - time > CACHE_TIMEOUT * 1000) {
        return true;
    }
    return false;
}
