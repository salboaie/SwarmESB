
var container = require("semantic-firewall").container;
var assert = require("semantic-firewall").assert;

require("./hiJackAssert.js");

/*
container.declareDependency('leaf', [], function(){
        return {type:"leaf"}
}) */


container.service('node1', ['node_base'], function(outOfService, leaf){
    if(!outOfService){
        return {type:"node", leaf:leaf}
    } else {
        assert.true(leaf == null);
    }
})


container.service('node2', ['node1'], function(outOfService, leaf){
    if(!outOfService) {
        return {type: "node", leaf: leaf}
    }
})

var fakeRoot = {fakeRoot:true};
var root = fakeRoot;

container.service('node3', ['node2'], function(outOfService, leaf){
    if(!outOfService) {
        return {type: "node", leaf: leaf}
    }
})


container.service('root', ['node1', 'node2', 'node3'], function(outOfService, node1, node2, node3) {
    if (!outOfService) {
        assert.true(node1 != null);
        root = {type: "root", node1: node1, node2: node2, node3:node3};
        return root;
    } else {
        root = fakeRoot;
    }
});

assert.steps("Root should get resolved and then disabled and enabled again",
        [
            function(next){
                assert.true(root.fakeRoot);
                container.resolve('node_base', {type:"node_base"});
                next();
            },
            function(next){
                assert.false(root.fakeRoot);
                assert.true(root.node1.leaf.type == 'node_base');
                next();
            },
            function(next){
                container.outOfService('node_base');
                next();
            },
            function(next){
                assert.true(root.fakeRoot);
                next();
            },
            function(next){
                container.resolve('node_base', {type:"node_base_reloaded"});
                next();
            },
            function(next){
                assert.false(root.fakeRoot);
                assert.true(root.node1.leaf.type == 'node_base_reloaded');
                next();
            }
        ]
);




