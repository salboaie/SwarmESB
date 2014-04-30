
var redis = require("redis");

exports.bindAll = function(redisConnection){
      function Wrapper(){
          this.contextSwarmName = "wrapper";
      }
      var wrap = new Wrapper();

    function getFunction(name){
        return function(x){

            var args = [];
            for(var i = 0; i< arguments.length; i++){
                args.push(arguments[i]);
            }
            //console.log(name, args)
            redisConnection[name].apply(redisConnection,args);
        }
    }

      for(var v in redisConnection){
          if(typeof redisConnection[v] == "function"){
              wrap[v] = getFunction(v);
          }
      }
    return  wrap;
}
