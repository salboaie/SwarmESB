#callflow:  control your asynchronous code with explicit flows

### This library purpose a concept of flow based on explicit continuations. 
    
The idea of the library is to represent asynchronous code (or even synchronous but complex code) as a set pf phases in a workflow. 
The code using asynchron avoids the infamous pyramid of callbacks by structuring code in a list of functions (phases) that also control the transitions between phases using "next" and "continue" primitives.
Transitions between  phases can get triggered by directly calls to other phases, by asynchronous calls (next) and by a continuations given in place of a asynchronous callback.
The flows have also the concept of "join" that  are dormant phases that get called only when the whole list of declared phases got executed.
        

### Syntax & primitives: The syntax of a flow is a JSON with values as functions phases and join phases 

The flow can be seen as a set of phases and the computation will pass through each one (synchronously and asynchronously)
Each phase has a name. Phases can be function phases or join phases. If a phase is a function phase, the field value in the JSON is a function. 
If a phase is a join phase, the value of the field is an object with a member "join" containing a list with the names of the phases that are waited until the join phase get called (see examples).
Two special functions, called flow primitives, are available in all   

### Flow variables     

When a flow is created, a Java Script object is created. This object beside containing as members all the functions of the flow, the "next" and "continue" functions, it can also contain arbitrary variables.
    
    
### Basic example:
    
      var flow = require("callflow");
      var f = flow.createFlow("Flow example", {
            begin:function(a1,a2){
                //.. code
                this.variable = false;
                this.step();
            },
            step:function(a){
                //this.variable is set in begin
                //.. code     
                        
            }
        });
        f();


### Example with a join and use of continue:
         
      var f = flow.createFlow("Flow example", {
            begin:function(a1,a2){
                //..
                this.step(true);
                this.next("step", "Comment explaining why was this function called", true); // quite similar with this.step(true) but step wll be executed at nextTick   
                
                asyncFunction(this.continue("callback","Called later by asyncFunction");
            },
            step:function(a){
                //a will be true in both cases
                //..code
                
            }
            callback:function(err,res){
                            //..
                
            }
            end:{
                join:"step,callback", //waits 2 calls of step and one of callback
                code:function(){
                //..called     
            }            
        });
        var flow = f();
        f.status(); // see the flow status
    

###   Integration with the "whys" module (https://github.com/salboaie/whys)

From the beginning, we created flows with the idea to have automated integration with the "whys" module. Each phase transitions is automatically logged with a "why" call explaining the transition.  
Beside automated integration, why calls can be performed at will anywhere and the why system will compact the tracking logs for each call.
"next" and "continue" functions have the second argument an string that is automatically passed to the why.
 
      var flow = require("callflow");
           var f = flow.createFlow("Flow example", {
                 begin:function(a1,a2){
                     //.. code
                     this.step.why("explanantions...")();                     
                 }.why("Additional info"),
                 step:function(a){
                     //.. code                
                 }.why("Additional info")
             });
             f.why("Additional info")();

