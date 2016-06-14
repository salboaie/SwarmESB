/*
Testing service to choreography
 Status: stable
 TODOs:
 */

/*
//New APIs
swarmDesc = cloneSwarmDescription(swarm, newName);
swarmDesc.addCtor();
swarmDesc.addPhase();


 swarm.result("phaseName, result);
 swarm.error("phaseName, error);
 swarm.onResult("phaseName|*", function(err, res))
 swarm.on("phaseName|*", function(phase))


 //a swarm will broadcast ALL  and will do  t.sc(description); that will create a new swarm

//a new CodeRepository

 */

var t = require("../lib/transformations.js");
var assert = require("double-check").assert;
var client = t.createRestClient();
var fs = require("./lib/fakeSwarm.js");


assert.steps("Interceptor transformation test ",[
    function(next) {
        var webServer = t.restAPI({
            port:3336,
            getEntity: {
                method:'get',
                params: ['entityId', 'token'],
                path:'/$entityId/$token',
                code:function(entityId, token){
                    return repository[entityId];
                }
            },
            createEntity: {
                method: 'put',
                params: ['token', 'entityId', '__body'],
                path : '/$token/$entityId',
                code:function(token, entityId, __body){
                    repository[entityId] = __body;
                    return entityId;
                }
            },
            updateEntity: {
                method: 'post',
                params: ['entityId', '__body'],
                path : '/$entityId/$token',
                code:function(entityId, __body){
                    repository[entityId] = __body;
                    return entityId;
                }
            },
            deleteEntity: {
                method: 'delete',
                params: ['entityId', 'token'],
                path : '/$entityId/$token',
                code:function(entityId, token){
                    delete repository[entityId];
                    return true;
                }
            }
        });
        next();
    },

    function(next) {
        t.interceptor({
            baseUrl:	'http://localhost:3336',
            port:   "30011",
            swarm: "intercept.js",
            adapter: "SWTransformer",
            getEntity: {
                method:'get',
                params: ['entityId', 'token'],
                path:'/$entityId/$token'
            },
            createEntity: {
                method: 'put',
                params: ['token', 'entityId', '__body'],
                path : '/$token/$entityId'
            },
            updateEntity: {
                method: 'post',
                params: ['entityId', '__body'],
                path : '/$entityId/$token'
            },
            deleteEntity: {
                method: 'delete',
                params: ['entityId', 'token'],
                path : '/$entityId/$token'
            }
        });
        next();
    },
    function(next) {
        client.get("http://localhost:30011/100/secret", function (err, res) {
            assert.equal(err, undefined);
            assert.equal(res, "undefined");
            next();
        })
    },
    function(next) {
        client.putObject("http://localhost:30011/secret/100", {hello: "world"}, function (err, res) {
            assert.equal(err, null);
            assert.equal(res, 100);
            next();
        })
    },
    function(next) {
        client.postObject("http://localhost:30011/100/secret", {hello: "swarms"}, function (err, res) {
            assert.equal(err, null);
            assert.equal(res, 100);
            next();
        })
    },
    function(next) {
        client.getObject("http://localhost:30011/100/secret", function (err, res) {
            assert.equal(err, null);
            assert.equal(res.hello, "swarms");
            next();
        })
    },
    function(next) {
        client.delete("http://localhost:30011/100/secret", function (err, res) {
            assert.equal(err, null);
            assert.equal(res, "true");
            next();
        })
    },
    function(next) {
        client.get("http://localhost:30011/100/secret", function (err, res) {
            assert.equal(err, null);
            assert.equal(res, "undefined");
            next();
        })
    }]);

assert.end();