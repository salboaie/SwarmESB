
var asynchron = require("../lib/asynchron.js");
var assert = require("assert");


describe("Testing nasync calls", function(){

    function loadPenguin(nickName, callBack){
        //callBack(undefined, nickName);
        if(nickName == "M"){
            callBack(new Error("No penguin available " + nickName));
        } else {
            callBack(null,nickName);
        }

    }

    function loadPenguinFamily(father, mother, callBack){
        assert.equal(father, "F");
        assert.equal(mother, null);
        callBack(undefined, father + " " + mother);
    }

    /*
     call nasync in place of async and errors are automatically handled by returning null
     Sometimes you want this behaviour (for example when reading from a cache and you expect missing keys)
     */
    var mother = loadPenguin.nasync('F');
    var father = loadPenguin.nasync("M");


    var family = loadPenguinFamily.async(mother, father);

    it("Should call with family \'F null\'", function(done){
        (function (family){
            assert.equal(family, "F null");
            done();
        }).wait(family, function(err){
                assert.equal(err, null);
            })
    });

})

