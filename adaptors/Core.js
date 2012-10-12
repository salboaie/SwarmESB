/*
 Arguments: configFile
*/


//it will load the code because of the name "Core"
// TODO: Make explicit swarm loading in Core...

thisAdapter = require('swarmutil').createAdapter("Core",null,null,true);
config      = thisAdapter.config["Core"];



