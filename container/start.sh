#!/bin/bash
export NODE_PATH=/usmed/server/
export SWARM_NODE_TYPE='spiridon'
export SWARM_PATH=/usmed/server/
export PATH=$PATH:/usmed/dcm4che/dcm4che-2.0.28/bin/
http-server /usmed/web/USMED/www/ -p 80&
http-server /usmed/server/admin/public/ -p 8000&
node /usmed/server/adapters/usmedLaunch.js
