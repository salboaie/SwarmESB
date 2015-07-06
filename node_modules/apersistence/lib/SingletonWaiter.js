/**
 * Created by salboaie on 4/6/15.
 */

function SingletonWaiter(){
    var singleton = null;
    var pending = [];

    this.setSingleton = function(s){
        singleton = s;
        pending.forEach(function(c){
            c();
        })
    }

    /* guarantee calls */
    this.gCall = function(callback){
        pending.push(callback);
        if(singleton){
            callback();

        }
    }
}

exports.create = function(){
    return new SingletonWaiter();
}