
var container = require("safebox").container;
var assert = require("double-check").assert;

require("./hiJackAssert.js");

/*
container.declareDependency('leaf', [], function(){
        return {type:"leaf"}
}) */


container.service('node1', ['leaf'], function(outOfService, leaf){
    if(!outOfService){
        assert.true(leaf.type == 'leaf');
        return {type:"node", leaf:leaf}
    } else {
        assert.true(leaf == null);
    }
})


container.service('node2', ['leaf'], function(outOfService, leaf){
    if(!outOfService) {
        assert.true(leaf.type == 'leaf');
        return {type: "node", leaf: leaf}
    }
})


var root = null;

assert.callback("Root should get resolved", function(done){
    container.service('root', ['node1', 'node2'], function(outOfService, node1, node2){
        if(!outOfService) {
            assert.true(node1 != null);
            assert.true(node2.leaf != 'leaf');
            root = {type: "root", node1: node1, node2: node2};
            done();
            return root;
        }
    })
});


assert.steps("Dependecies should get resolved until in root when resolve is called",
        [
            function(next){
                assert.true(root == null);
                container.resolve('leaf', {type:"leaf"});
                next();
            },
            function(next){
                assert.true(root != null, "root is null");
                assert.true(root.type == 'root');
                assert.true(root.node1 != null);
                assert.true(root.node2 != null);
                next();
            }
        ]);




