/**
 * Dummy adapter, used in tests
 */
require('swarmutil').createAdapter("Null*",null, function(swarm){
    cprint("Null* ignored swarm message "+ M(swarm));
}, false);



