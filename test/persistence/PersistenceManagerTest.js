/**********************************************************************************************
 * Vars
 **********************************************************************************************/
var util = require("swarmutil");
var adapterPort = 3000;
var adapterHost = "localhost";
var client;
var defaultMembersModel = {
    name: "defaultMembersModel",
    description: {
        meta: {
            persistence: "none"
        },
        m_string: {
            type: "string"
        },
        m_number: {
            type: "number"
        },
        m_int: {
            type: "int"
        },
        m_date: {
            type: "date"
        },
        m_boolean: {
            type: "boolean"
        }
    }
};


/**********************************************************************************************
 * Functions
 **********************************************************************************************/

function initialSetup() {
    globalVerbosity = false;
    swarmSettings.authentificationMethod = "testForceSessionId";
}

/**********************************************************************************************
 * Test
 **********************************************************************************************/
exports.PersistenceManagerTest = {
    setUp: function (callback) {
        initialSetup();
        client = util.createClient(adapterHost, adapterPort, "testUser", "testSession", "testTenant");
        setTimeout(function () {

            var createTableReq = {};
            createTableReq.type = "CREATE";
            createTableReq.name = defaultMembersModel.name;
            createTableReq.description = defaultMembersModel.description;

            client.removeAllListeners("PersistenceManager.js");
            client.on("PersistenceManager.js", function (data) {
                callback();
            });
            client.startSwarm("PersistenceManager.js", "processRequest", createTableReq);

        }, 1000);
    },


    tearDown: function (callback) {
        callback();
    },


    PUT_test: function (test) {
        testData =
        {
            m_string: 'string test',
            //TODO : check with more decimals
            m_number: 1234.57,
            m_int: 9876,
            m_boolean: true,
            m_date: new Date()
        };

        var putReq = {};
        putReq.type = "PUT";
        putReq.name = "requestPut";
        putReq.persistence = "DbPersistence";
        putReq.className = defaultMembersModel.name;
        putReq.data = testData;

        client.removeAllListeners("PersistenceManager.js");
        client.startSwarm("PersistenceManager.js", "processRequest", putReq);
        client.on("PersistenceManager.js", function (req) {
            var key;
            for (key  in testData) {
                if (testData[key] instanceof Date) {
                    test.equal(testData[key].time, req.request.data[key].time, "Checking " + key + ".");
                }
                else {
                    test.equal(testData[key], req.request.data[key], "Checking " + key + ".");
                }
            }
            test.ok(req.request.data.id, "Id is set.");
            testData['id'] = req.request.data.id;
            test.done();
        });
    },


    GET_test_no_cache: function (test) {
        var getReq = {};
        getReq.type = "GET";
        getReq.skipCache = true;
        getReq.name = "requestGet";
        getReq.persistence = "DbPersistence";
        getReq.className = defaultMembersModel.name;
        getReq.id = testData.id;

        client.removeAllListeners("PersistenceManager.js");
        client.startSwarm("PersistenceManager.js", "processRequest", getReq);
        client.on("PersistenceManager.js", function (req) {
            var expectedFilters = ['RuleEngine', 'DbPersistence', 'PersistenceCache', 'RuleEngine'];
            var key;
            for (key  in testData) {
                if (testData[key] instanceof Date) {
                    test.equal(testData[key].time, req.request.data[key].time, "Checking " + key + ".");
                }
                else {
                    test.equal(testData[key], req.request.data[key], "Checking " + key + ".");
                }
            }
            test.deepEqual(req.request.filters, expectedFilters);
            test.ok(req.request.data.id, "Id is set.");
            test.equal(req.request.data.id, testData['id']);
            test.done();
        });
    },


    GET_test_with_cache: function (test) {
        var getReq = {};
        getReq.type = "GET";
        getReq.name = "requestGet";
        getReq.persistence = "DbPersistence";
        getReq.className = defaultMembersModel.name;
        getReq.id = testData.id;

        client.removeAllListeners("PersistenceManager.js");
        client.startSwarm("PersistenceManager.js", "processRequest", getReq);
        client.on("PersistenceManager.js", function (req) {
            var expectedFilters = ['RuleEngine', 'PersistenceCache'];
            var key;
            for (key  in testData) {
                if (testData[key] instanceof Date) {
                    test.equal(testData[key].time, req.request.data[key].time, "Checking " + key + ".");
                }
                else {
                    test.equal(testData[key], req.request.data[key], "Checking " + key + ".");
                }
            }
            test.deepEqual(req.request.filters, expectedFilters);
            test.ok(req.request.data.id, "Id is set.");
            test.equal(req.request.data.id, testData['id']);
            test.done();
        });
    }
};
