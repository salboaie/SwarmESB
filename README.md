## SwarmESB  

SwarmESB is a new approach for creating scalable, complex, distributed and highly parallel systems.
Communication and how services get composed is supported by a powerful method that resemble "swarm behaviours" found in nature!

    Easy and fun! 

    Programming with asynchronous messages is more programmers-friendly than ever.
    
    Check our wiki: https://github.com/salboaie/SwarmESB/wiki


    Technologies: node.js, Redis, asynchronous messages, Message Bus, Enterprise Service Bus
    Usage of JavaScript is accidental, the swarming concept can be implemented on any modern platform.

SwarmESB ca be used as a light, open source, ESB (or Message Bus) for your enterprise applications.
Instead of message oriented communication or web services, you describe your communication between "nodes" in what
we call "swarm descriptions" or simple "swarms".
"Nodes" can be adapters to various servers or clients connected to the "swarming middleware": SwarmESB.

Your adapters can use web services as a particular case of providing existing APIs in a node.

## Examples
    
A swarm description is written in Java Script and is composed from:  variable declarations (for defaults),
constructors (functions that get called on the adapter that starts a swarm) and phases (code that get executed
remotely, usually in another node) 
    
The swarm described bellow will magically get executed without any other programming efforts in 3 nodes (processes):

            vars:{
                message:"Hello World",
            },
            start:function(){ //constructor  that can be executed in any adapter
                        this.swarm("concat");  // swarm is a "primitive" used to invoke execution in a phase
                    },
            concat:{ // phase that get executed in "Core" adapter
                node:"Core",
                code : function (){
                        this.message = this.message + " The swarming has begun! ";
                        this.swarm("print");    //move again
                    }
            },
            print:{ //print phase executed in "Logger" adapter
            node:"Logger",
            code : function (){
                cprint(this.message);    //use of some api, specific to the Logger node
                },
            }
 

Waw: each node could be on a different continent!  Check other swarms for parallel execution examples.


## Instalation:  https://github.com/salboaie/SwarmESB/wiki/Install-guide

## Conclusions:

    1. Maintainable code: Open/closed principle, no threads get abused (ever), simple
    2. High performance: We are using node.js and his asynchronous capabilities revealed no throughput degradation in
    our benchmarks. Network latency have no effect in capability of the system to execute things in parallel.
    3. Scalability: Load balancing and sharding (research) can be implemented using swarming concepts
    4. High availability: Still at the research level but looks promising


## License:

    LGPL