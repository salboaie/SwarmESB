/*
 Status: stable
 TODOs:

 */

var t = require("../lib/transformations.js");
var assert = require("double-check").assert;
var client = t.createRestClient();

var repository  = {};


assert.steps("CRUD test for file to service (FS) transformation",[
        function(next) {
            var webServer = t.restAPI({
                port:3334,
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
            client.get("http://localhost:3334/100/secret", function (err, res) {
                assert.equal(err, undefined);
                assert.equal(res, "undefined");
                next();
            })
        },
        function(next) {
            client.putObject("http://localhost:3334/secret/100", {hello: "world"}, function (err, res) {
                assert.equal(err, null);
                assert.equal(res, 100);
                next();
            })
        },
        function(next) {
            client.postObject("http://localhost:3334/100/secret", {hello: "swarms"}, function (err, res) {
                assert.equal(err, null);
                assert.equal(res, 100);
                next();
            })
        },
        function(next) {
            client.getObject("http://localhost:3334/100/secret", function (err, res) {
                assert.equal(err, null);
                assert.equal(res.hello, "swarms");
                next();
            })
        },
        function(next) {
            client.delete("http://localhost:3334/100/secret", function (err, res) {
                assert.equal(err, null);
                assert.equal(res, "true");
                next();
            })
        },
        function(next) {
            client.get("http://localhost:3334/100/secret", function (err, res) {
                assert.equal(err, null);
                assert.equal(res, "undefined");
                next();
            })
        }]);

assert.end();