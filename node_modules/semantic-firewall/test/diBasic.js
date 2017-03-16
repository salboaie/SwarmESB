
var container = require("semantic-firewall").container;
var assert = require("semantic-firewall").assert;
require("./hiJackAssert.js");

container.declareDependency('leaf', [], function(){
        return {type:"leaf"}
})


container.declareDependency('node1', ['leaf'], function(outOfService, leaf){
    assert.true(leaf.type == 'leaf');
    return {type:"node", leaf:leaf}
})


container.declareDependency('node2', ['leaf'], function(outOfService, leaf){
    assert.true(leaf.type == 'leaf');
    return {type:"node", leaf:leaf}
})


var root = null;

container.declareDependency('root', ['node1', 'node2'], function(outOfService, node1, node2){
    assert.true(node1 != null);
    root = {type:"root", node1:node1, node2:node2};
    return root;
})


assert.pass("Dependecies got resolved until in root",function(){
    assert.true(root.type == 'root');
    assert.true(root.node1 != null);
    assert.true(root.node2 != null);
});


