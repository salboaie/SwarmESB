#!/usr/bin/env bash
npm install
export NODE_PATH=`pwd`"/node_modules"
export SWARM_PATH=`pwd`
export SWARM_NODE_TYPE="demo"

node adapters/demoLaunch.js
 

