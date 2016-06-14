
var assert = require("assert");
var apersistence = require("../lib/abstractPersistence.js");
var async = require("asynchron");
var redis = require("redis");
var async = require("asynchron");

var uuid = require('node-uuid');
var objuid = uuid.v4();

var redisConnection = async.bindAllMembers(redis.createClient());
var persistence = apersistence.createRedisPersistence(redisConnection);

var dateNow = new Date(Date.now());

persistence.registerModel("TestModel", {
    ctor:function(){
        this.lastModified = dateNow;
    },
    name: {
        type:'string',
        default:"no name",
        pk:true
    },
    lastModified: {
        type:'date'
    }
});


describe("Test date fields", function(){

    it("Should save the date and return back properly...", function(done){

        var t1 = persistence.lookup.async("TestModel", objuid);
        (function(t1){
            assert.equal(t1.lastModified, dateNow);
            persistence.save(t1, function(err,res){
                assert.equal(t1.lastModified,dateNow)
                done();
            });
        }).wait(t1);

    });

});

