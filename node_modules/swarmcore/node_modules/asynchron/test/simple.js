var asynchron = require("asynchron");

var assert = require('assert');


function loadPenguin(nickName, callBack){
   callBack(undefined, nickName);
}

describe('Async calls', function(){

    function loadPenguinFamily(father, mother, callBack){
        callBack(undefined, 'We got a cute penguin family:' + father + " and " + mother);
    }

    var father = loadPenguin.async('MrPenguin');
    var mother = loadPenguin.async('MrsPenguin');

    var family = loadPenguinFamily.async(father, mother);

    it('Should wait for dependencies and load penguin family', function(done){
        (function (family){
            assert.equal(family, 'We got a cute penguin family:MrPenguin and MrsPenguin');
            done();
        }).wait(family);
    });

})


