/*
    The Core node loads from the disk the swarm descriptions
 */
var core = require ("../../lib/SwarmCore.js");
thisAdapter = core.createAdapter("Core");
//globalVerbosity = true;
thisAdapter.nativeMiddleware.uploadDescriptions();
