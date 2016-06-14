/**
 * Created by ctalmacel on 2/29/16.
 */
var assert = require('double-check').assert;
assert.callback("Test Js file",function(end){
    assert.equal(1,2);
    end();
});