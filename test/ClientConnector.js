var net = require("net");
var util = require("swarmutil");

function defaultLogin(sock, clientName, pass) {
    var cmd = {
        authorisationToken:"ok",
        sessionId:clientName,
        swarmingName:"login.js",
        command:"start",
        userId:null,
        commandArguments:[clientName, clientName, pass]
    };
    util.writeObject(sock, cmd);
}
//always call with new
function Connection(adaptorHost, adaptorPort, clientName, pass, callback) {

    this.client = null;
    this.clientName = clientName;
    this.cmdParser = null;

    this.client = net.createConnection(adaptorPort, adaptorHost);
    this.cmdParser = util.createFastParser(callback);
    this.client.setEncoding("UTF8");

    this.client.addListener("connect", function () {
        console.log("Client connected.");
        defaultLogin(this.client, this.clientName, pass);
    }.bind(this));

    this.client.addListener("data", function (data) {
        this.cmdParser.parseNewData(data);
    }.bind(this.con));

    this.client.addListener("close", function (data) {
        //this.connected = false;
        console.log("Disconnected from server");
    });
    return this;
}

Connection.prototype.writeCommand = function (command) {
    util.writeObject(this.client, command);
}

module.exports.createConnection = function (adaptorHost, adaptorPort, clientName, pass, callback) {
    return new Connection(adaptorHost, adaptorPort, clientName, pass, callback);
}
