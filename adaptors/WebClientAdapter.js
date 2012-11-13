

var sutil = require('swarmutil');

thisAdapter = sutil.createAdapter("ClientAdapter", null, null, false);

var myCfg = getMyConfig();
var serverPort      = 3000;
var serverHost      =  "localhost";

if(myCfg.port != undefined){
    serverPort = myCfg.port;
}

