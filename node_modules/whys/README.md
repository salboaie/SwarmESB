# whys
"whys" module provides a novel method for tracking errors and for tracking execution of complex asynchrounous Java Script (node.js code).
 This library is created for helping debugging of complex SwarmESB systems but it can be used in other projects. 

The why module works by adding a 'why' function the the Function prototype. Basically for every call of an "important" function you can explain why that function get called.
 
##Usage:
 Somewhere in your project do a 
 var why = require("whys");
 
 
On any function you can do things like:
 
 Example 1:
 
    var a = function().why("Because I want so"); // a will be a function but at each call the why subsystem will know why it got called
  
 Example 2:
  
    function async(function(){}.why("Because this is a callback and is asynchronously called sometimes");
 
 Example 3:
 
     function f(){}
     f.why("Specific call of f")();
 

 Example 4 (Commented example):

    var assert = require("double-check").assert;
    var logger = require("double-check").logger;
    var why = require("../lib/why.js");
    
    
    logger.record = function(record){  //you have to integrate with your own logging system by overriding this functions
      console.log("Failed assert:",JSON.stringify(record));
    }
    
    function nop(){  //do nothing but can be recorded in the why history
    
    }
    
    function func(callback){
       nop.why("Nop recording")();
       callback(null, why.dump());   // why.dump() takes the current execution context
    };
    
    
    assert.callback("Test example", function(end){
       func.why("Demonstrate attaching descriptions at runtime")( function(err, result){
           console.log(result);
           assert.equal(result.whystack.length, 2);
           end();
       });
    }.why("Test callback"));


The output of the commented example is:
   
    { whystack: 
       [ { step: 'Callback for func', args: [Object], other: undefined },
         { step: 'Demonstrate attaching descriptions at runtime',
           args: [Object],
           other: undefined },
         { step: 'Test callback', args: [Object], other: undefined } ],
      history: [ { step: 'Nop recording', args: [], other: undefined } ],
      exceptionContextSource: undefined }
    [Pass] Test example
    logWhy dummy implementation. Overwrite the logWhy function in the logger
    Dump: { whystack: [ { step: 'Test callback', args: [Object], other: undefined } ],
      history: 
       [ { step: 'Nop recording', args: [], other: undefined },
         { step: 'Callback for func', args: [Object], other: undefined },
         { step: 'Demonstrate attaching descriptions at runtime',
           args: [Object],
           other: undefined } ],
      exceptionContextSource: undefined }

Explanations: 

By calling  why.dump() you can get information about the set of calls explained with "why" that happened before calling the dump function. 
You do not have to put the why() calls everywhere but only on important steps of your asynchronous, multiple microservices, algorithms and workflows.

All the exceptions in why guarded functions get tracked and automatically logged  
By manually calling why.dump() you can display context information on the caught exceptions.
The history of the calls reveals the order of the calls.  
 
Observations:
    When all the related asynchronous calls are done, the why implementations will call the logger.logWhy function. You are responsible of properly implementing a logWhy function.
    In the swarm enabled systems (see SwarmESB project), the why functions handles also the accounting of swarm contexts so you do not have to call the S function for callbacks. 
  
 
## Todo
 
 This project is a research project, use carefully. We still analyse performance implications and imagine solutions and new features. 
 
 Major milestones in front: integrate with asynchron library and SwarmESB
  
 