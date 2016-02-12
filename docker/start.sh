#!/bin/bash
export NODE_PATH=/SwarmESB/
export SWARM_NODE_TYPE='demo'
export SWARM_PATH=/SwarmESB/
http-server /SwarmESB/admin/public/ -p 8000&
nohup redis-server&
node /SwarmESB/adapters/demoLaunch.js
