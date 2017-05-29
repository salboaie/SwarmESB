var core = require("swarmcore");
core.createAdapter("UsersManager");


require('./userRelatedFunctions');
require('./accessRelatedFunctions');
require('./registerUserManagerTypes');

var container = require('safebox').container;



container.declareDependency("UsersManager",['userFunctionality','accessFunctionality'],function(outOfService,userFunctionality,accessFunctionality){
    if(outOfService){
        console.log("UsersManager failed");
    }else{
        makeAPIGlobal(userFunctionality);
        makeAPIGlobal(accessFunctionality);
        console.log("UsersManager available");
        setTimeout(function() {
            startSwarm("initSwarmESB.js", "init");
        },2000);
    }
});

function makeAPIGlobal(API){
    for(var field in API) {
        global[field] = API[field]
    }
}
