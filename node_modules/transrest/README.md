# TransREST:  SwarmESB transformation support to transformations  

To enable complex communications between the distributed bus provided by SwarmESB and the external world, we researched the types of transformation we have to create to enable inbound and outbound usage
of web services. Our researched discovered that we can implement 5 types of transformations. The current implementation is in the TransREST open source project [10]. 
##Service to Functions transformations (SF)
This transformation can transform a REST service to functions usable in a processing node (eg Swarm ESB adapter) and choreographies. Intuitively, this transformation is just a quick method to generate some function that asynchronously call remote web services. This simple transformation allow a better documentation of the code but also permits an uniform working style inside of SwarmESB based project where the adapters are plain JavaScript code.
##Choreography to Service Transformation (CS)
This  transformation expose a swarm workflow/choreography as a REST web service. While the sam based systems are real time system that allow push notification and multiple results for a call, this transformation offers an bridge to the application that are designed to work in a ask/request method promoted by REST services.  The CS transformation allows that existing services to be refactored to use SwarmESB and allows the reuse of the existing skills and tools.
##Function to Service Transformation (FS)
The FS transformation  expose functions as REST web APIs . This type of transformation is very useful for testing and mocking web services but also for the creation of REST web services with very little code. As we see bellow, the transformation language hide all the wiring usually required to create web services.
##Service to Choreography Transformation (SC)
This transformation can transform a REST Service to a workflow/choreography (swarm description/script) based on an existing template. This kind of transformation is complex and requires metaprogramming capabilities form the choreography implementation. Currently this transformation is not implemented in SwarmESB until we found a case where a workaround based on other transformation is not feasible. The SF transformation allows manual creation of new choreography based on existing web services. 
##Interceptor Transformation (I)
This transformation can be seen as composing SC and CS transformations.  A I transformation can be seen as a smart proxy between some arbitrary REST APIs and an exposed REST APIs. The benefit will be that the transformation can intercept every calls and can  enrich each call with some arbitrary logic that will be hosted in a swarm workflow description.
 

Example of a SF transformation that take an remote REST web service from 'http://localhost:3000 and and expose as set of functions with the name of the blocks.

    {
       baseUrl:   'http://localhost:3000',
       getEntity: {
           method:'get',
           params: ['entity', 'token'],
           path:'/$entity/$token'
       },
       createEntity: {
           method: 'put',
           params: ['entityId', 'token', '__body'],
           path : '/?id=$entityId&token=$token'
       }
    }

Any transformation is composed from global properties and a list of transformation blocks. The global properties are basically key value assignments. Each block is composed from a list of block properties. A set of properties is present in all the transformations (and are called mandatory properties) but other are optional or transformation specific. The mandatory properties are "method", "params" and "path". The values for "method" are "get", "post", "put", "delete" corresponding to the HTTP verbs. The "path" parameter specify the part of the URL that is used to route the request to the actual implementation. The path value is a string that consist from fixed strings and "parameters". All parameters are prefixed by an "$" character that enable the url parse to determine the place of the corresponding values in the actual urls.  The values for "params" property is a JavaScript array of string denoted parameters names. The actual usage of the parameter depends on the type of the transformation. These parameters should appear as strings in the url prefixed by a "$". To terminate a parameter placeholder and to begin a new string or a new parameter, the "/" character should be used.  As we can see, this schema is similar with the ones used in other routing web engines. A similar schema is used the connect node.js framework but in place of "$" they use ":".
Additionally, we support variables that are not part of the URL, specifically the "__body" parameter that will contain the content of the POST and PUT requests. All the name of variables prefixed with "__" ar reserved to be used with parameters of the POST and PUT body content.    In the global section, a set of attributes can be used. "baseURL" key means the base url of the rest services that is transformed in adapters or workflows.  The "node" means the group (or the node type for the processing nodes) on which the transformation will be executed. Other specific properties are specific to particular transformation types.
Tests and code demonstrating the transformations can be found in the test folder. 
          

