
var adaptorPort      = 3000;
var adaptorHost      = "localhost";
var util = require("swarmutil");
var assert = require('assert');

var net = require("net");


var client1 = createConnection("client1",receiveCommand,"ok");
var client2 = createConnection("client2",receiveCommand,"ok");
var client3 = createConnection("client3",receiveCommand,"ok");
var client4;

var msgCount=0;
var successLoginCount=0;
var disconectsCount=0;
var expectedSuccessLoginCount=3;

function receiveCommand(obj){
    if(obj.isOk == true){
        successLoginCount++;
    }
    if(successLoginCount == 3){
        client4 = createConnection("client4",receiveCommand,"notok");
    }
    console.log("Received " + JSON.stringify(obj) +"\n");
}

function defaultLogin(sock,clientName,pass){
    var cmd={
        authorisationToken:"ok",
        sessionId:clientName,
        swarmingName:"login.js",
        command:"start",
        //userId:null,
        commandArguments:[clientName,clientName,pass]
    };
    //console.log(JSON.stringify(cmd));
    util.writeObject(sock,cmd);
}

function checkAsserts(){
   // assert.equal(successLoginCount,expectedSuccessLoginCount);
    if(disconectsCount == 1){
        client4 = createConnection("client3",receiveCommand,"ok");
    }

    if(disconectsCount == 2){
        expectedSuccessLoginCount++;
    }
}

function createConnection(clientName,callback,pass){

    var con={
        client:null,
        clientName:clientName,
        cmdParser:null
    };
    con.client = net.createConnection(adaptorPort);
    con.cmdParser = util.createFastParser(callback);
    con.client.setEncoding("UTF8");
    con.client.addListener("connect", function() {
        console.log("Client connected.");
        defaultLogin(this.client,this.clientName,pass);
    }.bind(con));

    con.client.addListener("data", function(data) {
        this.cmdParser.parseNewData(data);
    }.bind(con));

    con.client.addListener("close", function(data) {
    console.log("Disconnected from server");
        disconectsCount++;
        checkAsserts();
    });
    return con;
}

setTimeout(
        function(){
            client1.client.destroy();
            client2.client.destroy();
            client3.client.destroy();
            //client4.client.destroy();
        },
        5000);


