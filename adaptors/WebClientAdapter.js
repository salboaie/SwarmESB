
var sutil = require('swarmutil');
var journey = require('journey');

thisAdapter = sutil.createAdapter("WebClientAdapter", null, null, false);
//thisAdapter.loginSwarmingName   = "login.js";
//globalVerbosity = true;

var myCfg = getMyConfig();
var serverPort      = 8000;
var serverHost      =  "localhost";

if(myCfg.port != undefined){
    serverPort = myCfg.port;
}

if(myCfg.bindAddress != undefined){
    serverHost = myCfg.bindAddress;
    serverHost = serverHost.trim();
    if (serverHost.length == 0 || serverHost == '*') {
        serverHost = null;
    }
}

var requestZone = {};

onRequestResponse = function(swarm, requestId){
    requestZone[requestId].write(J(swarm));
    delete requestZone[requestId];
}

function startMySwarm(req, res, data) {
    console.log(data);
    try{
        var jo = JSON.parse(data);
        var reqId = generateUID();
        requestZone[reqId] = res;
        if(jo.targetAdapter == undefined) {
            jo.targetAdapter = this.adapterName;
        }
        startSwarm("startRemoteSwarm.js",
            "start",
            jo.targetAdapter,
            jo.session,
            jo.swarm,
            jo.ctor,
            this.adapterName+":"+reqId,
            jo.args);
    } catch(err){
        logErr("Wrong request ", err);
    }
}

var router = new(journey.Router);

// Create the routing table
router.map(function () {
    this.root.bind(function (req, res) { res.send("Welcome"); });
    this.put (/startSwarm/).bind(startMySwarm);
});

require('http').createServer(function (request, response) {
    var body = "";
    request.addListener('data', function (chunk) { body += chunk });
    request.addListener('end', function () {
        //
        // Dispatch the request to the router
        //
        router.handle(request, body, function (result) {
            response.writeHead(result.status, result.headers);
            response.end(result.body);
        });
    });
}).listen(serverPort,serverHost);



