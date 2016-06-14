
var container = require("safebox").container;
var assert = require("double-check").assert;

require("./hiJackAssert.js");

/*
container.declareDependency('leaf', [], function(){
        return {type:"leaf"}
}) */


container.service('node1', ['leaf', "leaf1"], function(outOfService, leaf, leaf1){
    if(!outOfService){
        assert.true(leaf.type == 'leaf');
        assert.true(leaf1.type == 'leaf');
        return {type:"node", leaf:leaf}
    } else {
        assert.true(leaf == null);
    }
})


container.service('node2', ['leaf'], function(outOfService, leaf){
    if(!outOfService) {
        assert.true(leaf.type == 'leaf');
        container.resolve('leaf2', {type:"leaf"});
        container.resolve('leaf3', {type:"leaf"});
        return {type: "node", leaf: leaf}
    }
})


container.service('node3', ['leaf2', 'leaf3'], function(outOfService, leaf2, leaf3){
    //... not improtant
})


var root = null;

assert.callback("Root should get resolved", function(done){
    container.service('root', ['node1', 'node2', 'node3'], function(outOfService, node1, node2){
        if(!outOfService) {
            assert.true(node1 != null);
            assert.true(node2.leaf != 'leaf');
            root = {type: "root", node1: node1, node2: node2};
            done();
            return root;
        }
    })
});


assert.steps("All dependecies should get resolved until in root when resolve is called on leaf, leaf1, leaf2, leaf3",
        [
            function(next){
                assert.true(root == null);
                container.resolve('leaf', {type:"leaf"});
                container.resolve('leaf1', {type:"leaf"});
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




