## SwarmESB  


SwarmESB presents a new approach for creating distributed systems comunicating by asynchronous messages.
Swarming can be for SOA's orchestration what REST is for SOAP.

A "swarm" is a set of related messages with some basic inteligence and is based on an intuitive point of view: 
 computer processes comunicating by using asynchronous messages are more like "dumb trees/flowers" visited by "smart 
swarms of bees" than smart "people" communicatig by "messages". 
This intuition have a powerfull efect on reducing complexity of many distributed systems (allready proved by SOA but SwarmESB offers a better perspective).

 SwarmESB is an open source project implementing a new aproach: "Swarming architecture" that you could reuse 
for your new multi-tenant systems that will transparently acquire the benefits of sclability, high availability, highly
parallel computing and loose coupling usually obtained with asynchronous messages, message queues, pub/sub channels, 
message and service busses. While this project is build using Node.js and Redis, this project will present "swarming" 
as a new fundamental concept, comparable, but from the code maintainability perspective a lot simpler than direct 
usage of Enterprise Integration Patterns or than the Actor model used in Scala and Erlang.

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



## Easy and fun! 
    A new approach for programming with asynchronous messages.
    
    Check our wiki: https://github.com/salboaie/SwarmESB/wiki


    Technologies: node.js, Redis, asynchronous messages, Message Bus, Enterprise Service Bus
    Usage of JavaScript is accidental, the swarming concept can be implemented on any modern platform.

SwarmESB ca be used as a light, open source, ESB (or Message Bus) for your enterprise applications.
Instead of message oriented communication or web services, you describe your communication between "nodes" in what
we call "swarm descriptions" or simple "swarms".
"Nodes" can be adapters to various servers or clients connected to the "swarming middleware": SwarmESB.

Your adapters can use web services as a particular case of providing existing APIs in a node.


## Instalation:  https://github.com/salboaie/SwarmESB/wiki/Install-guide

## Conclusions:

    1. Maintainable code: Open/closed principle, no threads get abused (ever), simple
    2. High performance: We are using node.js and his asynchronous capabilities revealed no throughput degradation in
    our benchmarks. Network latency have no effect in capability of the system to execute things in parallel.
    3. Scalability: Load balancing and sharding (research) can be implemented using swarming concepts
    4. High availability: Still at the research level but looks promising


## License:

    LGPL