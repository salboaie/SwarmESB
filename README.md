## SwarmESB  (beta version)

Warning: SwarmESB is a new aproach for creating scalable, complex, distributed and highly parallel systems.
In a few hours you can have your maintainable system working!
All the communication and how services get composed is described in the simplest way!
The essence of swarming idea is that offer a practical way to describe communication and to structure your code for 
a distributed application in a maintainable, easy to understand way. We claim that by using SwarmESB, you can get
the benefits of asynchronous message passing without paying the price.

Please, check our claims :) !

SwarmESB ca be also used as a light, open source, ESB replacement for your enterprise applications.
Instead of message oriented communication or web services, you describe your communication between "nodes" in what
we call "swarm descriptions" or simple "swarms".
"Nodes" can be adaptors to various servers or clients connected to the "swarming middleware" :SwarmESB.

Your adaptors can use web services as a particular case of providing some specific API in a node.


## Examples
    
A swarm description is basically Java Script and is composed from:  variable declarations (for defaults),
constructors (functions that get called on the adaptor that starts a swarm) and phases (code that get executed
remotely, usually in another node) 
    
The swarm described bellow will magically get executed without any other programming efforts in 3 different nodes:

            vars:{
                message:"Hello World",
            },
            start:function(){ //constructor  that can be executed in any adaptor
                        this.swarm("concat");  // swarm is a "primitive" used to invoke execution in a phase
                    },
            concat:{ // phase that get executed in "Core" adaptor
                node:"Core",
                code : function (){
                        this.message=this.message + " The swarming has begun! ";
                        this.swarm("print");    //move again
                    }
            },
            print:{ //print phase executed in "Logger" adaptor
            node:"Logger",
            code : function (){
                cprint(this.message);    //use of some api, specific only to the Logger node
                },
            }
 

Imagine: each node could be on a different continent! 
Check other swarms for parallel execution examples.



## Installation

1. Install Node.js
2. Install and run a Redis server
2. Get SwarmESB (with git) in a folder, ex : c:\work\SwarmESB
3. Create a folder for node modules, ex C:\work\node, set the environment variable NODE_PATH to C:\global\node\node_modules
4. Go in C:\global\node and do:

    npm install swarmutil
    npm install redis
    npm install node-uuid

5. Set environment variable SWARM_PATH  to your SwarmESB installation (ex. c:\work\SwarmESB)
7. Check and modify your configuration (%SWARM_ESB%\etc\config)

        Warning: modify SWARM_ESB_ID, otherwise you can't reuse the redis server for multiple ESBs
        
8. Check the code for swarms, adaptors and tests.
9. Run SwarmESB:

        node adaptors/Core.js       //loads swarm descriptions
        node adaptors/Logger.js     //errors and infos get here
        node adaptors/Launcher.js   //starts running for other adaptors
        
10. Create new swarms and adaptors. Play with it.

        Don't forget to restart your adaptors when you change their code. I will work on a feature to do it automatically.
        
11.It works. Got the idea. Great! Send me an email with your opinions, improvements ideas, dislikes, etc.


## Conclusions:

    1. Maintainable code: Open/closed principle, no threads get abused (ever), simple
    2. High performance: We are using node.js and his asynchronous capabilities revealed no throughput degradation in
    our benchmarks. Network latency have no effect in capability of the system to execute things in parallel.
    3. Scalability: Load balancing and sharding can be implemented using swarming concepts
    4. High availability: Still at the research level but looks promising


## License:

    LGPL