SwarmCore
=========

Swarm 2.0 implementation of the SwarmESB (http://github.com/salboaie/SwarmESB) project. SwarmESB is a light ESB for node.js.
SwarmCore includes core functionality for working with swarms version 2.0. Is a refactored version of the SwarmUtil module and will not need SwarmESB project. It depends on asynchron, apersistence and acl-magic modules.


## What is new
   1. Improved error handling:
   - "do" block: ensure that a phase is executed at least once
   - transaction blocks: mechanism to implement distributed transactions for swarms (not stable)
   - better monitoring and error handling (store data in redis)
   2. better semantic for swarm primitive
   - swarm is doing load distribution. You can nou launch many Adapters of the same type and they will balance the loading
   - broadcast primitive implementation to send swarm to all members of a group

## Work in progress
   - implement long live processes using the swarm paradigm (equivalent in expressing workflow (BPM code) or rule engines)
   - UI to: display real time monitoring data, thresholds,etc
   - use swarms with docker. The plan is to create a very simple UI to launch and configure new docker containers executing swarms.


Warning: this is an experimental version. It is not yet ready for production if you are not a swarm core developer.
For production code, you could use the old SwarmESB and SwarmUtil module (check branches).

SwarmCore will become a module in npm, but for now follow use the following install instructions:

## Install for some small tests and quick play

    1. get SwarmCore from GitHub
    2. install Redis server
    3. set SWARM_PATH folder to the SwarmCore directory
    4. install all dependencies, go in SwarmCore folder and run: "npm install -g"
    5. now you can launch adapters and the tests to get an impression about swarming

## Install for creating real projects

    1. get SwarmCore from GitHub
    2. install redis
    3. install all node.js dependencies with npm (run "node install -g" in the SwarmCore folder)
    3. create a new project, with your source control. Set SWARM_PATH variable on this folder
    4. create folders like etc, adapters, swarms in this new project
    5. clone etc/config for your own folders and cases
    6. create your new Adapters, tests, swarms
    7. you should start adapters from SwarmCore (from etc/adapters ) like Core.js, DefaultLogger.js, PhaseMonitor.js


How to:
## Create a new Swarm node (Adapter)

    var core = require ("../../lib/SwarmCore.js");  //check your relative paths accordingly with your conventions
    thisAdapter = core.createAdapter("Give_Me_A_Name");
    /*  now add your functions and they could be called by executing swarms */

    /*l
        Notice: The name yu gave is the name of a group of nodes doing similar tasks. "swarm" primitive is doing load distribution by implementation.
        You can start as many nodes in the same group and they will be used.
        For normal cases, load distribution is similar with load balancing as is trying to not overload already busy nodes
        and is doing something like Round Robin strategy when choosing nodes.
        For tasks that are not taking comparable amounts of time to execute, you could be in need to implement your own balancing strategies
    */

## Create a new swarm file or a new folder with your swarms
    Create a folder for swarms in your folder, copy one example and add your ctors and phases.
    Don't forget to modify the etc/config to add in Core/path section your folder.

## Launch multiple adapters
    The Launcher adapter can be configured to launch multiple Adapters. When one adapter is crushing, the Launcher is restarting it automatically.
