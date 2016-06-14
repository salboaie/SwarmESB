

var parser = require("../lib/parsePath.js");
var assert = require("double-check").assert;


assert.pass("Testing test/$hello/asdsadas$world", function(){
    var res = parser.parsePath("test/hello/asdsadasworld", "test/$hello/asdsadas$world");
    assert.equal(res.hello, "hello");
    assert.equal(res.world, "world");

})


assert.pass("Testing test/hello=$hello", function(){
    var res = parser.parsePath("test/hello=alfa", "test/hello=$hello");
    assert.equal(res.hello, "alfa");
})


assert.pass("Testing test/$hello/$world", function(){
    var res = parser.parsePath("test/hello/world", "test/$hello/$world");
    assert.equal(res.hello, "hello");
    assert.equal(res.world, "world");
})


assert.pass("Testing test/hello=$hello with encoded url", function(){
    var res = parser.parsePath("test/hello=%27alfa%20si%20omega%27", "test/hello=$hello");
    assert.equal(res.hello, "'alfa si omega'");
    assert.equal(res.world, undefined);

})


assert.pass("Testing test/hello=$hello/world=$world with encoded url", function(){
    var res = parser.parsePath("test/hello=%27alfa%20si%20omega%27/world=world", "test/hello=$hello/world=$world");
    assert.equal(res.hello, "'alfa si omega'");
    assert.equal(res.world, 'world');

})


assert.pass("Expect failing to parse (null result) on test/hello=$hello/world=$world with damaged url", function(){
    var res = parser.parsePath("test/hello=%27alfa%20si/%20omega%27/world=world", "test/hello=$hello/world=$world");
    assert.equal(res, null);
})


assert.pass("Expect parsing properly encoded / ", function(){
    var res = parser.parsePath("test/hello=%27alfa%20si%20%2Fomega%27/world=world", "test/hello=$hello/world=$world");
    assert.equal(res.hello, "'alfa si /omega'");
    assert.equal(res.world, "world");
})





