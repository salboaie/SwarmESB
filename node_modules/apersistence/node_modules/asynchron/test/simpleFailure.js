

var asynchron = require("../lib/asynchron.js");
var assert = require("assert");


describe("Error handling", function(){
    function loadPenguin(nickName, callBack){
        //callBack(undefined, nickName);
        callBack(new Error("No penguin available " + nickName));
    }

    function loadPenguinFamily(father, mother, callBack){
        callBack(undefined, 'In harvest.family we got those cute penguin children objects');
    }

    var mother = loadPenguin.async('MrsPenguin');
    var father = loadPenguin.async('MrPenguin');


    var family = loadPenguinFamily.async(mother, father);

    it("Should call callback in wait ", function(done){
        (function (family){
            console.log("Test failed:", family);
        }).wait(family, function(err){
                console.log("Test passed! We can pass or handle errors here!", err);
                done();
            });
    });

});

