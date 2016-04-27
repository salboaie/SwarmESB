#SwarmESB central repository. Refactoring and master plan:
This is the new version of SwarmESB, based on [SwarmCore] (https://github.com/salboaie/swarmcore "SwarmCore") that adds:  
 - default load distribution between Adapters (done)
 - new broadcast primitive (done)
 - "do" syntax to describe guaranteed message delivery (at least once)  
 - allow creation of personalised/custom ESBs that can use other middleware than Redis (done)
 - refactoring in progress to grow it around a DI container for better stability (almoust done)
 - based on a new powerful ACl module (acl-magic module/done)
 - deployment support for docker containers (done)
 - UI with system monitoring (done)
 - better logging (done) 
 - support for typed persistence, complex custom type representation, privacy ontologies ("apersistence" module) 
 - support for executable choreography (done, more improvements in progress)
 - distributed transactions mechanisms (planned)
 - support for representation of long living processes (planned)

## What is SwarmESB ?

Swarm communication is a micro-services architecture based on a new message communication pattern we call "swarms" 
It offers an starting architecture for cloud and enterprise systems. 
The usual method of doing message passing is to have relatively intelligent processes, objects or actors sending and receiving dumb messages. 
Thinking to messages as relatively smart beings visiting relatively non intelligent places, we noticed a positive effect on the quality of the code and a new path for 
decomposing complex applications in small services. 
SwarmESB is using swarm communication for creating an easy to grow Enterprise Service Bus. 
You add your own microservices (we call adapters) and describe how  microservices get composed for your usecases in a coupling free DSL (swarm descriptions).
SwarmESB it is groing in the direction of executable coreographies to offer by design an improved architecture for security and privacy .


Presentation:  https://docs.google.com/presentation/d/1xn1L9bbiD1TUY7ku5d0V_zF7SBkH3ANQ2uN8AxAXaA8/

![Overview](http://salboaie.github.com/images/swarmDiagram.png "SwarmESB")


A "swarm" is a set of related messages with some basic intelligence and is based on an intuitive point of view:
 computer processes communicating by asynchronous messages are more like "dumb trees/flowers" visited by "smart 
swarms of bees" than "smart people" communicating by "dumb messages".
This intuition have a powerful effect on reducing complexity of many distributed systems (already proved by SOA)
Service orchestration with SwarmESB is elegant, there is no need to learn new languages and difficult concepts: just use Java Script code and a few simple concepts.


 SwarmESB is an open source project implementing a new approach: "Swarming architecture" that you could reuse
for your new multi-tenant systems that will transparently acquire the benefits of scalability, high availability, highly
parallel computing and loose coupling usually obtained with asynchronous messages, message queues, pub/sub channels and
using a message or service bus. While this project is build using Node.js and Redis, this project will present "swarming"
as a new  concept, comparable, but simpler than direct 
usage of Enterprise Integration Patterns or the Actor model used in Scala and Erlang.

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
 

See: each node could be on a different continent or hosted by a different organisation!  



## Easy and fun! 
        
    Check our wiki: https://github.com/salboaie/SwarmESB/wiki

    Technologies: node.js, Redis, PUB/SUB
    
SwarmESB ca be used as a light, open source, ESB (or Message Bus) for your enterprise applications.
Instead of message oriented communication or web services, you describe your communication between "nodes" in what
we call "swarm descriptions" or simple "swarms".
"Nodes" can be adapters to various servers or clients connected to the "swarming middleware": SwarmESB.

Your adapters can use web services as a particular case of providing existing APIs in a node.


## Installation:  https://github.com/salboaie/SwarmESB/wiki/Install-guide

## Conclusions:

    1. Maintainable code: Open/closed principle, no threads get abused (ever), simple
    2. High performance: We are using node.js and his asynchronous capabilities revealed no throughput degradation in
    our benchmarks. Network latency have no effect in capability of the system to execute things in parallel.
    3. Scalability: Load balancing and sharding (research) can be implemented using swarming concepts
    4. High availability: Still at the research level but looks promising

   
    
#Copyright
(c) Axiologic Research & Alboaie Sînică. 
Code License: LGPL or MIT 
The content of the README and of the wiki is Public Domain

Commercial versions derived from this project are allowed. However, it would be desirable that all ESBs developed around swarm communication idea to get identical APIs and compatible programming styles.
Contact salboaie@gmail.com for details. 


#Supporters
WebStorm, the best IDE for node.js and JS 
* http://www.jetbrains.com

A free book about swarms

* https://github.com/jwulf/SwarmCoreByExample/
