require("double-check").exceptions.register('assertFail', function(explanation){
    console.log("***************** dumping for assert fail debug:");
    require("double-check").container.dump(); //easy dump to show what happened
    console.log("*****************  End dump\n");

    if(explanation){
        throw(new Error("Assert or invariant has failed: " + explanation));
    } else {
        throw(new Error("Assert or invariant has failed"));
    }

})
