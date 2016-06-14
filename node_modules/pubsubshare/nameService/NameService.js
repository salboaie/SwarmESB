/**
 * Created by salboaie on 5/25/15.


var container           = require("safebox").container;


function NameService(redisPersistence, localConfig){
    //localConfig.identity, localConfig.host, localConfig.port
    this.lookup = function(name, callback){

    }
}


container.service('NameService', ['redisPersistence', 'localConfig'], function(outOfService, redisPersistence, localConfig){
    if(!outOfService){
        return null;
    } else {
        return new NameService(redisPersistence, localConfig);
    }
})

 */
