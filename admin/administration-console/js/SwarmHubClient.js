function SwarmHubClient(){}

(function(){
	var callBacks = {};
   /*  var self = this; */
   
   //we are client so we initiate a connection to current window;
   var connection = CommunicationService.prototype.getHubConnection(window.parent);

    function dispatchingCallback(swarm){
        var o = callBacks[swarm.meta.swarmingName];
        if(o){
            var myCall = o[swarm.meta.currentPhase];
            if(!myCall){
                cprint("Warning: Nobody listens for swarm " + swarm.meta.swarmingName + " and phase " + swarm.meta.currentPhase);
            } else {
                try{
                    if(myCall instanceof Array){
                        myCall.map(function(c){
                            c(swarm);
                        });
                    } else {
                        myCall(swarm);
                    }
                } catch(err){
                    cprint("Error in swarm callback " + err.stack, err);
                }
            }
        } else {
            cprint("Warning: Nobody listens for swarm " + swarm.meta.swarmingName + " and phase " + swarm.meta.currentPhase);
        }
    }

    SwarmHubClient.prototype.on = function(swarmName, phase, callBack){
        var swarmPlace = callBacks[swarmName];
        if(!swarmPlace){
            swarmPlace = {};
            callBacks[swarmName] = swarmPlace;
            if(connection){
                connection.subscribeToChannel(swarmName, dispatchingCallback);
            }
        }

        var phasePlace = swarmPlace[phase];
        if(!phasePlace){
            swarmPlace[phase] = callBack;
        }
        else{
            if(phasePlace instanceof Array){
                phasePlace.push(callBack);
            } else {
                swarmPlace[phase] = [phasePlace, callBack];
            }
        }

    }


    SwarmHubClient.prototype.off = function(swarm, phase, callBack){
        var c = callBacks[swarm][phase];
        if(c instanceof Array){
            var idx = c.indexOf(callBack)
            if(idx != -1){
                c.splice(idx, 1);
            }
        } else {
            delete callBacks[swarm][phase];
        }
    }
	
	SwarmHubClient.prototype.startSwarm = function(swarmName){
		//TODO: implement this!
		var args = [swarmName];
        for(var i = 1,len = arguments.length; i<len;i++){
            args.push(arguments[i]);
        }
		
		if(connection){
			connection.publishToChannel(swarmName, args);
		}
	}

    /*
     generic observer implementation for Java Script. Created especially for integration swarms with angular.js projects. Usually angular services should be observable by controllers
     */
    SwarmHubClient.prototype.createObservable = function(template){
        function Observer(){
            var observers = [];
            var notifiedAtLeastOnce = false;

            for(var v in template){
                this[v] = template[v];
            }

            this.observe = function(c, preventAtLeastOnce){
                observers.push(c);
                if(!preventAtLeastOnce && notifiedAtLeastOnce){
                    c();
                }
            }

            this.notify = function(){
                observers.forEach(function(c){
                    c();
                })
                notifiedAtLeastOnce = true;
            }
        }
        return new Observer(template);
    }
})()