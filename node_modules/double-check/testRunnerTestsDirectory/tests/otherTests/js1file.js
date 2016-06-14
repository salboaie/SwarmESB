/**
 * Created by ctalmacel on 2/29/16.
 */
var assert = require('double-check').assert;
assert.callback("Test Js1 file",function(end){
    assert.fail("Should pass when fails...",function(){throw new Error()});
    end();
});