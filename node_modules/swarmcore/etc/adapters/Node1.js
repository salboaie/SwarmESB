var core = require ("swarmcore");
thisAdapter = core.createAdapter("Node1");

thisAdapter.initFileBusNode("FB_Node1", "localhost", 3001);
