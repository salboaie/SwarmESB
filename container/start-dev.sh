#!/bin/bash
cwd=`pwd`
export NODE_PATH=$cwd/
export SWARM_NODE_TYPE='demo'
export SWARM_PATH=$cwd
http-server $cwd/admin/public/ -p 8000&
nohup redis-server&
node $cwd/adapters/demoLaunch.js
