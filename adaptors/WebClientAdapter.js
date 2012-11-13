
var sutil = require('swarmutil');

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

function startSwarm(req, res,sessionId, data) {
    console.log(data);

    client.lpush(roomId,JSON.stringify(data),function(){
        count(null,res,roomId);
    });
}

var router = new(journey.Router);

// Create the routing table
router.map(function () {
    this.root.bind(function (req, res) { res.send("Welcome") });
    this.put(/^\/(.+)\/startSwarm/).bind(startSwarm);
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



