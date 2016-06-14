var apersistence = require("../lib/persistence.js");
var async = require("asynchron");


var persistence = apersistence.createMemoryPersistence();
var assert = require("assert");

describe("Testing basic APIs", function(){

    persistence.registerModel("UserModel", {
        ctor:function(){

        },
        name: {
            type:'string',
            default:"no name",
            pk:true
        },
        age: {
            type:'int',
            default:0
        },
        printAge: function(){
            console.log("User: ", this.name, " age ", this.age);
        }
    });

    var userJhon = persistence.lookup.async("UserModel", "Jhon");

    it("Should retrive a model instance", function(done){
        (function(userJhon){

            persistence.save(userJhon, function(err, diff){
                assert.equal(diff[0], "name");
                userJhon.age = 20;
            });


            var jhonAgain = persistence.lookup.async("UserModel", "Jhon");

            it("Should be able to retrive again after pk", function(done){

                (function(jhonAgain){
                    assert.equal(jhonAgain.age, 20);

                    userJhon.age = 999;

                    persistence.save(userJhon, function(err, diff){

                        assert.equal(diff[0], "age");
                        userJhon.age = 999;
                    });
                    userJhon.name = "Passing test user ";
                    jhonAgain.printAge();
                    done();
                }).wait(jhonAgain);

            })

            done();
        }).wait(userJhon);

    });
})

