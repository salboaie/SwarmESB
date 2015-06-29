require("semantic-firewall").exceptions.register('assertFail', function(explanation){
    console.log("***************** dumping for assert fail debug:");
    require("semantic-firewall").container.dump(); //easy dump to show what happened
    console.log("*****************  End dump\n");

    if(explanation){
        throw(new Error("Assert or invariant has failed: " + explanation));
    } else {
        throw(new Error("Assert or invariant has failed"));
    }

})
