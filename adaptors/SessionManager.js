/*
How sessions are handled in swarmESB:
 SessionId
     responseURI
    actor:id


 session

 TCPOutlet

 WebSocketOutlet

 WebServiceOutlet

 */
var uuid = require('node-uuid');
var workerId = "worker:" + uuid.v4();

require('swarmutil').createAdapter(workerId,onReadyCallback);

function onReadyCallback(){


}


doWork = function(){
    //do something
}