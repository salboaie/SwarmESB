/**
 * Adapter that opens swarmESB to php or other environments that can't do sockets, WebSockets, etc but can do REST
 *
 */
var sutil   = require('swarmutil');
var journey = require('journey');
var util    = require("util");

thisAdapter = sutil.createAdapter("RestAdapter", null, null, false);
//thisAdapter.loginSwarmingName   = "login.js";
//globalVerbosity = true;

var myCfg = getMyConfig("RestAdapter");
var serverPort      = 8000;
var serverHost      = "localhost";

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

function requestOutlet(request, response){
    var outletId =  generateUID();
    this.getOutletId = function(){
        return  outletId;
    }

    this.getSessionId = function(){
        return outletId;
    }

    this.onHoney = function(swarm) {
        console.log("WebClientAdapter Honey:" + J(swarm));
        response.end(J(swarm));
        thisAdapter.deleteOutlet(this);
    }
}

/**
 *
 * @param req
 * @param res
 * @param data
 */
function startMySwarm(req, res, jo) {
    try{

        //var jo = typeof(data) === 'string' ? JSON.parse(data) : data;
         //dprint("Start swarm request " + util. data);

        var reqOutlet = new requestOutlet(req, res);
        thisAdapter.addOutlet(reqOutlet);

        if(jo.targetAdapter == undefined) {
            jo.targetAdapter = thisAdapter.nodeName;
        }

        var args = [];
        args.push(jo.targetAdapter);
        args.push(jo.session);
        args.push(jo.swarm);
        args.push(jo.ctor);
        args.push(reqOutlet.getOutletId());
        for(var i=0; i< jo.args.length; i++){
            args.push(jo.args[i]);
        }
        startRemoteSwarm.apply(null,args);
    } catch(err){
        logErr("Wrong request ", err);
    }
}

var router = new(journey.Router);

// Create the routing table
router.map(function () {
    this.root.bind(function (req, res) { res.send("Welcome"); });
    this.route('/startSwarm').bind(startMySwarm);
    //this.put(/startSwarm/).bind(startMySwarm);
    //this.get(/startSwarm/).bind(startMySwarm);
});

require('http').createServer(function (request, response) {

    var body = "";
    request.addListener('data', function (chunk) { body += chunk });
    request.addListener('end', function () {
        //
        // Dispatch the request to the router
        //
        var utfData = body.toString('utf8');        

        var obj= {};
        try
        {
             obj = JSON.parse(utfData);
        }
        catch(err){                        
            response.end("Wrong format!");
            return;
        }
        
        startMySwarm(request,response, obj);
        /*router.handle(request, utfData, function (result) {
            response.writeHead(result.status, result.headers);
            response.end(result.body);
        });*/

    });
}).listen(serverPort,serverHost);



