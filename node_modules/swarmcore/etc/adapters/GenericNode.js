/*
  Generic node for tests or running swarm only computation
 */

var program = require('commander');
program
    .version('1.0.1')
    .usage('[options] ')
    .option('-n,-name <name>', 'adapter name')
    .parse(process.argv);


var core = require ("../../lib/SwarmCore.js");
if(!program.Name){
 console.log(program);
 program.help();
 process.exit();
}
thisAdapter = core.createAdapter(program.Name);
globalVerbosity = false;


var contexts = [];

getLocalContext = function(name){
 var c = contexts[name];
  if(!c){
   contexts[name] = c = {};
  }

 return c;
}

removeLocalContext = function(name){
 delete contexts[name];
}