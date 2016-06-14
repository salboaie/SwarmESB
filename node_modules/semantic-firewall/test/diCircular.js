
var container = require("semantic-firewall").container;
var assert = require("semantic-firewall").assert;

require("./hiJackAssert.js");


container.service('node1', ['node2'], function(outOfService, leaf){
    if(!outOfService){
        assert.true(leaf.type == 'leaf');
        return {type:"node", leaf:leaf}
    } else {
        assert.true(leaf == null);
    }
})


container.service('node2', ['node3'], function(outOfService, leaf){
    if(!outOfService) {
        assert.true(leaf.type == 'leaf');
        return {type: "node", leaf: leaf}
    }
})


container.service('node3', ['node1'], function(outOfService, leaf){
    if(!outOfService) {
        assert.true(leaf.type == 'leaf');
        return {type: "node", leaf: leaf}
    }
})

var root = null;

assert.callback("Root should not get resolved in this version... no message about circularity detection yet so the test should fail", function(done){
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


container.resolve('leaf', {type:"leaf"});
