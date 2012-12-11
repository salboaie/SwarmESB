/*
How sessions are handled in swarmESB:

 SessionManager configuration
    - uuid
    - maxSessions


 SessionInfo:
    sessionId

    userId
    tenantId
    pendingCmds
    isClosed

 SessionId
     responseURI: uuid of the entry adapter
    clientSwarmletId

 session
     JSONOutlet
     WebSocketOutlet
     WebServiceOutlet

 */

var uuid = require('node-uuid');
var workerId = "worker:" + uuid.v4();
thisAdapter = require('swarmutil').createAdapter(workerId,null);

thisAdapter.join("@SessionManager");