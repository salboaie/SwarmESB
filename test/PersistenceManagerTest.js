var adapterPort = 3000;
var adapterHost = "localhost";
var util = require("swarmutil");
var assert = require('assert');

globalVerbosity = false;
swarmSettings.authentificationMethod = "testForceSessionId";
var client = util.createClient(adapterHost, adapterPort, "testUser", "testSession", "testTenant");


function persistenceHandler(obj) {
    console.log(obj.request.name + " - Filters : " + obj.request.filters.join(', '));
    console.error(obj.request.name + " - Data : " + JSON.stringify(obj.request.data));
}

setTimeout(
    function () {
        var request = {};
        request.name = "request1";
        request.persistence = "DbPersistence";
        request.data = {test_number: Math.random()};
        request.filters = [];
        request.type = "PUT";
        request.className = "test";

        client.startSwarm("PersistenceManager.js", "processRequest", request);
        client.on("PersistenceManager.js", persistenceHandler);
    },
    1000);


setTimeout(
    function () {
        var request1 = {};
        request1.name = "request2";
        request1.id = "1";
        request1.persistence = "DbPersistence";
        request1.data = {};
        request1.filters = [];
        request1.type = "GET";
        request1.className = "test";

        client.startSwarm("PersistenceManager.js", "processRequest", request1);
    },
    2005);
 setTimeout(function () {
 process.exit();
 }, 5000);