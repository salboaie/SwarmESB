/**
 * Adapter that opens swarmESB to php or other environments that can't do sockets but can do REST
 *
 */
var sutil = require('swarmutil');


thisAdapter = sutil.createAdapter("SIOClientAdapter", null,null,false);

thisAdapter.join("@SessionManagers","groupSessionManagers.js", "start");


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
var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

app.listen(81);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log("XXX" + J(data));
    });
});