/*
    Status: stable
    TODOs:

*/

var t = require("../lib/transformations.js");
var assert = require("double-check").assert;

var testStrategy= {
    begin:function(){},
    step:function(name, context, description){
        context[name] = function(){};
    },
    end:function(){}

}

assert.pass("Testing generic transformation", function(){
    var res = t.generateTransformation({
        swarmName: 	'EntityManagerFlow',
        swarmTemplate:	'example.js',
        node:		'EntityManager',
        baseUrl:	'http://localhost/service.php',
        getEntity: {
            method:'get',
            params: ['entity', 'token'],
            path:'$entity/$token',
            after:'afterGetEntity'
        },
        createEntity: {
            method: 'put',
                params: ['entity', 'token', '__body'],
                path : 'id=$entity&token=$token',
                after: 'afterCreateEntity'
        }
    }, testStrategy);
    assert.equal(typeof(res.getEntity), "function", "getEntity should be a function!");
    assert.equal(typeof(res.createEntity), "function", "createEntity should be a function!");
});


var proxy = null;


var repository  = {};

assert.steps("Testing type SF (Service to Function) transformation",[
    function(next) {
        var webServer = t.restAPI({
            port:3337,
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
                params: ['entityId', 'token', '__body'],
                path : '/?id=$entityId&token=$token',
                code:function(entityId, token, __body){
                    repository[entityId] = __body;
                    return entityId;
                }
            }
        });
        next();
    },
    function(next){
        proxy = t.sf({
            baseUrl:	'http://localhost:3337',
            getEntity: {
                method:'get',
                params: ['entity', 'token'],
                path:'/$entity/$token'
            },
            createEntity: {
                method: 'put',
                params: ['entityId', 'token', '__body'],
                path : '/?id=$entityId&token=$token'
            }
        });
        next();
    },
    function(next){
        proxy.createEntity(100, "secret", 'content', function(err, res){
            assert.equal(err, null);
            assert.equal(res, '100');
            next();
        });
    },
    function(next){
        proxy.getEntity(100,"secret",function(err, res){
            assert.equal(err, null);
            assert.equal(res, "content");
            next();
        });
    }
    ]);


assert.end();