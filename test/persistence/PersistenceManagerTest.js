/**********************************************************************************************
 * Vars
 **********************************************************************************************/
var nodeUtil = require('util');
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
        if (client) {
            callback();
            return;
        }

        initialSetup();
        client = util.createClient(adapterHost, adapterPort, "testUser", "testSession", "testTenant");
        setTimeout(function () {

            var createTableReq = {};
            createTableReq.type = "CREATE";
            createTableReq.persistence = "DbPersistence";
            createTableReq.className = defaultMembersModel.name;
            createTableReq.params = {
                description: defaultMembersModel.description
            };

            client.removeAllListeners("PersistenceManager.js");
            client.on("PersistenceManager.js", function (result) {
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
        putReq.persistence = "DbPersistence";
        putReq.className = defaultMembersModel.name;
        putReq.params = {
            data: testData
        };

        client.removeAllListeners("PersistenceManager.js");
        client.startSwarm("PersistenceManager.js", "processRequest", putReq);
        client.on("PersistenceManager.js", function (req) {
            console.log("PUT_test" + nodeUtil.inspect(req.result));
            var key;
            for (key  in testData) {
                if (testData[key] instanceof Date) {
                    test.equal(testData[key].time, req.result[key].time, "Checking " + key + ".");
                }
                else {
                    test.equal(testData[key], req.result[key], "Checking " + key + ".");
                }
            }
            test.ok(req.result.id, "Id is set.");
            testData['id'] = req.result.id;
            test.done();
        });
    },


    GET_test_no_cache: function (test) {
        var getReq = {};
        getReq.skipCache = true;
        getReq.type = "GET";
        getReq.persistence = "DbPersistence";
        getReq.className = defaultMembersModel.name;
        getReq.params = {
            id: testData.id
        };

        client.removeAllListeners("PersistenceManager.js");
        client.startSwarm("PersistenceManager.js", "processRequest", getReq);
        client.on("PersistenceManager.js", function (req) {
            console.log("GET_test_no_cache result " + nodeUtil.inspect(req.result));
            console.log("GET_test_no_cache filters " + nodeUtil.inspect(req.historyFilters));
            var expectedFilters = ['RuleEngine', 'DbPersistence', 'PersistenceCache', 'RuleEngine'];
            var key;
            for (key  in testData) {
                if (testData[key] instanceof Date) {
                    test.equal(testData[key].time, req.result[key].time, "Checking " + key + ".");
                }
                else {
                    test.equal(testData[key], req.result[key], "Checking " + key + ".");
                }
            }
            test.deepEqual(req.historyFilters, expectedFilters);
            test.ok(req.result.id, "Id is set.");
            test.equal(req.result.id, testData['id']);
            test.done();
        });
    },


    GET_test_with_cache: function (test) {
        var getReq = {};
        getReq.type = "GET";
        getReq.persistence = "DbPersistence";
        getReq.className = defaultMembersModel.name;
        getReq.params = {
            id: testData.id
        };

        client.removeAllListeners("PersistenceManager.js");
        client.startSwarm("PersistenceManager.js", "processRequest", getReq);
        client.on("PersistenceManager.js", function (req) {
            console.log("GET_test_with_cache result " + nodeUtil.inspect(req.result));
            console.log("GET_test_with_cache filters " + nodeUtil.inspect(req.historyFilters));
            var expectedFilters = ['RuleEngine', 'PersistenceCache'];
            var key;
            for (key  in testData) {
                if (testData[key] instanceof Date) {
                    test.equal(testData[key].time, req.result[key].time, "Checking " + key + ".");
                }
                else {
                    test.equal(testData[key], req.result[key], "Checking " + key + ".");
                }
            }
            test.deepEqual(req.historyFilters, expectedFilters);
            test.ok(req.result.id, "Id is set.");
            test.equal(req.result.id, testData['id']);
            test.done();
        });
    },

    QUERY_test: function (test) {
        var selectQueryReq = {};
        selectQueryReq.type = "QUERY";
        selectQueryReq.persistence = "DbPersistence";
        selectQueryReq.className = defaultMembersModel.name;
        selectQueryReq.params = {
            query: "select * from " + defaultMembersModel.name
        };

        client.removeAllListeners("PersistenceManager.js");
        client.startSwarm("PersistenceManager.js", "processRequest", selectQueryReq);
        client.on("PersistenceManager.js", function (req) {
            console.log("QUERY_test result " + nodeUtil.inspect(req.result));
            console.log("QUERY_test filters " + nodeUtil.inspect(req.historyFilters));
            var expectedFilters = ['DbPersistence'];
            test.deepEqual(req.historyFilters, expectedFilters);
            test.done();
        });
    }
};
