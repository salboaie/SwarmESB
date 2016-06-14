
var assert = require("assert");
var apersistence = require("../lib/abstractPersistence.js");
var redis = require("redis");
var async = require("asynchron");


var redisConnection = async.bindAllMembers(redis.createClient());
var persistence = apersistence.createRedisPersistence(redisConnection);


persistence.registerModel("TestModel", {
    name: {
        type:'string',
        default:"no name",
        pk:true
    },
    age: {
        type:'int',
        default:0,
        index:true
    },
    sex: {
    type:'boolean',
    default:true
    },
    active: {
        type:'boolean',
        default:false
    }
},function(){});


var t1 = persistence.lookup.async("TestModel", "T1");
var t11 = persistence.lookup.async("TestModel", "T11");
var t3 = persistence.lookup.async("TestModel", "T2");



(function(t1, t11, t3){
    t1.age = 1;
    t11.age = 1;
    t3.age = 3;
    console.log("Loading objects... starting tests:");
    persistence.saveObject(t1, function(err,res){
        //console.log("Saving ", res);
    });
    persistence.save(t11);
    persistence.save(t3);
}).wait(t1, t11, t3);


setTimeout(function(){
  var values =  persistence.filter.async("TestModel", {"age": 1});
    (function(values){
        console.log("Testing that filter age 1 returns 2 values... ");
        assert.equal(values.length, 2);
    }).wait(values);

    var age3Values =  persistence.filter.async("TestModel", {"age": 3});
    (function(age3Values){
        console.log("Testing that filter age 3 returns 1 value... ");
        assert.equal(age3Values.length, 1);
    }).wait(age3Values);

    var age999Values =  persistence.filter.async("TestModel", {"age": 999});
    (function(age999Values){
        console.log("Testing that filter age 999 returns 0 values... ", age999Values);
        assert.equal(age999Values.length, 0);
    }).wait(age999Values);


    setTimeout(function(){
        process.exit(0);
    }, 1000)


    var sexValues =  persistence.filter.async("TestModel", {"sex": true});
    (function(sexValues){
        console.log("Failed test!");
    }).wait(sexValues, function(err){
            console.log("Negative test passed!");
        });

}, 1000);


