//returns an object with the parsed variables

var urlencode = require('urlencode');


exports.parsePath = function(path, pathDescription){
    var i = 0;
    var j = 0;
    var inVariable = pathDescription[0] == "$";
    var varName = "";
    var separator = "";

    function consumeJunk(){
        if(path[i] == pathDescription[j]){
            i++;
            j++;
        } else {
            if(pathDescription[j] == '$'){
                inVariable = true;
                j++;
                varName = "";
                while(j < pathDescription.length ){
                    var c = pathDescription[j];
                    var m = c.match(/\w/);
                    if(m){
                        varName += c;
                        j++;
                    } else {
                        separator = c;
                        break;
                    }
                }
               if(varName.length == 0){
                   return true;
               }
            }  else {
                return true;
            }
        }
        return false;
    }

    function extractVariable(){
        var res = "";
        while(i < path.length && path[i] != separator){
            res += path[i];
            i++;
        }
        if(i < path.length && path[i] == separator){
            separator == "";
            i++;
            j++;
        }
        inVariable = false;
        res = urlencode.decode(res);
        return res;
    }

    var res = {};

    while(i < path.length && j < pathDescription.length ){
        if(consumeJunk()){
            return null;
        };
        if(inVariable){
            //console.log("Finding ", varName)
            res[varName] = extractVariable();
        }
    }

    return res;
}
