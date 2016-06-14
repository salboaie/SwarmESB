# container node.js module
DI container inspired by angular.js with one major twist: a service can become "out of service" and your entire application parts will know that they have to work in "fail safe" mode. If everything is working fine again all parts depending on the failing component will get notified and normal working will be magically enabled again.

# Why?
 We found that existing modules for DI doesn't handle fails. Externale services can go down or the network can go down and error recovery code should automaticaly go up as fast as possible. Without a solid foundation on how objects get wired it is quite dificult to prevent loosing important data when such failures happens.

 We extened a bit idea of DI to go beyound object instantiation on knowning precisely when a specific feature is ready or not to be used in other zones of the application. Also, simple having an object instance is not enough, you usually want to known when an object is god to use, a connection is ready or an subsystem  is properly initialised. Therefore the API offerd by this module is created to provide nice sollutions on the problems caused by inherent node.js's asyncronism in the context of DI.

# Install
npm install container 

    /*now in your code you can get an instance of the container*/
    var container = require("safebox").container;

#API

## service
    /* name: is the name of the service
      arr: array with dependencies (names) for this service
      callback: function called when all dependencies are ready
    */
    container.service(name, arr, callback)

The callback given to service or declareDependecy functions will behave like in angular except that the first parameter will be always a boolean (outOfService flag) that will signal that the callback is called for invalidating the current service or for proper initialisation

## declareDependency
    /*  identical with  service but for better intuition.
    A callback can instantiate multiple local/closure variables that are not exposed services.
    */
    container.declareDependency(name, arr, callback)

## resolve
    /* Directly assign a value to the service. It can't be null!!!!
    It will try to initialise other services depending on name.
    */
    container.resolve(name,value)

## outOfService
    /*  Declare that a service or feature is not working properly. 
    All the services depending on this will get notified
    */
    container.outOfService(name)
    /*
    Now.. all the services depending on 'name' got notified and are working in fail recovery mode.
    You have to call container.resolve(name, value) to enable normal working
    */


# Example

    
    container.service('node', ['node_base'], function(outOfService, node_base){
        if(!outOfService){
            return {type:"node"}
        } else {
           //... will be called anyway at the begining for initialisation
        }
    })
    
    var fakeRoot = {fakeRoot:true};
    var root = fakeRoot;
    container.service('root', ['node'], function(outOfService, node) {
        if (!outOfService) {
            assert.true(node1 != null);
            root = {type: "root", node: node};
            return root; //value used as value
        } else {
            root = fakeRoot; //code handling out of service request (caching request or something else)
        }
    });

    /* initialisation will be triggered by calling container.service('node_base', [],..) or: */
    container.resolve('node_base', value)


# Test cases

You can find other  examples in the test folder

#Observation
We do not try to treat circular dependencies. Circular services will never be initialised. 
Normally it should not be a problem because even a smoke test should easily catch such errors. Some automated tests  should catch them also.
