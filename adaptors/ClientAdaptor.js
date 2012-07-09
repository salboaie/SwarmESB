/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 * To change this template use File | Settings | File Templates.
 */

var redisHost       = "localhost";
var redisPort       = 6379;
var thisAdaptor;
var serverPort      = 3000;

var sutil = require('swarmutil');

function ClientTcpServer(port,adaptor){
    console.log("Starting client server on 3000");
    var net   	= require('net');
    this.server = net.createServer(
        function (socket){
            sutil.newOutlet(socket);
        }
    );
    this.server.listen(port);
};

process.on('message', function(m){
    //console.log('CHILD got message:', m);
    redisHost       = m.redisHost;
    redisPort       = m.redisPort;
    thisAdaptor     = sutil.createAdaptor("ClientAdaptor",redisHost,redisPort);
    thisAdaptor.loginSwarmingName = "login.js";
    new ClientTcpServer(serverPort);
});


