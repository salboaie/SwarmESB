/*
 Status: stable
 TODOs:

 */

var t = require("../lib/transformations.js");
var assert = require("double-check").assert;
var client = t.createRestClient();

var fs = require("./lib/fakeSwarm.js");



assert.steps("CS (Choreography to Service) transformation test ",[
    function(next) {
        var webServer = t.cs({
            port:3333,
            getEntity: {
                method:'get',
                params: ['entityId', 'token'],
                path:'/$entityId/$token',
                resultPhase:"get"
            },
            createEntity: {
                method: 'put',
                params: ['token', 'entityId', '__body'],
                path : '/$token/$entityId',
                resultPhase:"put"
            },
            updateEntity: {
                method: 'post',
                params: ['entityId', '__body'],
                path : '/$entityId/$token',
                resultPhase:"post"
            },
            deleteEntity: {
                method: 'delete',
                params: ['entityId', 'token'],
                path : '/$entityId/$token',
                resultPhase:"delete"
            }
        });
        next();
    },
    function(next) {
        client.get("http://localhost:3333/100/secret", function (err, res) {
            assert.equal(err, undefined);
            assert.equal(res, "undefined");
            next();
        })
    },
    function(next) {
        client.putObject("http://localhost:3333/secret/100", {hello: "world"}, function (err, res) {
            assert.equal(err, null);
            assert.equal(res, 100);
            next();
        })
    },
    function(next) {
        client.postObject("http://localhost:3333/100/secret", {hello: "swarms"}, function (err, res) {
            assert.equal(err, null);
            assert.equal(res, 100);
            next();
        })
    },
    function(next) {
        client.getObject("http://localhost:3333/100/secret", function (err, res) {
            assert.equal(err, null);
            assert.equal(res.hello, "swarms");
            next();
        })
    },
    function(next) {
        client.delete("http://localhost:3333/100/secret", function (err, res) {
            assert.equal(err, null);
            assert.equal(res, "true");
            next();
        })
    },
    function(next) {
        client.get("http://localhost:3333/100/secret", function (err, res) {
            assert.equal(err, null);
            assert.equal(res, "undefined");
            next();
        })
    }]);

assert.end();