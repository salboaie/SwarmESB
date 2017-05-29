function SwarmHub(iframeSlave){
    var callBacks = {};
    var self = this;

    var connection;
	var swarmConnection;

    if(iframeSlave){
        connection = CommunicationService.prototype.getHubConnection(iframeSlave);
    }

    function dispatchingCallback(swarm){
        var o = callBacks[swarm.meta.swarmingName];
        if(o){
            var myCall = o[swarm.meta.currentPhase];
            if(!myCall){
                /*cprint("Warning: Nobody listens for swarm " + swarm.meta.swarmingName + " and phase " + swarm.meta.currentPhase);*/
				dispatchToSlave(swarm);
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
            dispatchToSlave(swarm);
        }
    }

    function dispatchToSlave(swarm){
		cprint("Info: Nobody listens for swarm " + swarm.meta.swarmingName + " and phase " + swarm.meta.currentPhase + " in master frame");

		if(self.sendMessagesToSlave)
		{
			cprint("Info: Trying to send into slave frame...");
			self.sendMessagesToSlave(swarm);
		}
    }

    function setSwarmConnectionListner(swarmName){
        if(swarmConnection){
            swarmConnection.on(swarmName, dispatchingCallback);
        }
    }

    this.on = function(swarmName, phase, callBack){
        var swarmPlace = callBacks[swarmName];
        if(!swarmPlace){
            swarmPlace = {};
            callBacks[swarmName] = swarmPlace;
            setSwarmConnectionListner(swarmName);
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


    this.off = function(swarm, phase, callBack){
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

    var pendingCommands = [];

    var disconected_start_swarm = function(){
        var args = [];
        var newCmd = {
            meta: {
                swarmingName: arguments[0]
            },
            pending:{

            }
        }
        newCmd.onResult = function(phaseName, callback){
            newCmd.pending[phaseName] = callback;
        }
        args.push(newCmd);
        for(var i = 1,len = arguments.length; i<len;i++){
            args.push(arguments[i]);
        }
        pendingCommands.push(args);
    }

    this.startSwarm = disconected_start_swarm;
	
	function receiveMessageFromSlave(event){
		var message = event.data;
		var args = message.data;
		if(args && args.length && args.length>1){
			var swarmName = args[0];
			var swarmPhase = args[1];

			if(!self.sendMessagesToSlave){
                self.sendMessagesToSlave = function(swarm){
                    if(!swarm.meta){
                        //just a simple test in order to check if we got a swarm object
                        return;
                    }
                    //reply to Slave
                    if(connection){
                        connection.publishToChannel(swarm.meta.swarmingName, swarm);
                    }
                }
            }

            setSwarmConnectionListner(swarmName);
			self.startSwarm.apply(self, args);
			
		}else{
			eprint("The message should include swarmName and swarmPhase");
		}
	}
	
	if(connection){
	    connection.subscribe(receiveMessageFromSlave);
    }

    function doConnection(loginCtor, username, password, expectedPhase, successHandler, errorHandler){
        var config = Config().swarmClient;
        var self = this;
        this.on("login.js", expectedPhase, function (swarm) {
            if(successHandler){
                successHandler(swarm.authenticated, swarm.sessionId);
            }
            self.off("login.js", expectedPhase);
        });

        if(swarmConnection){
			swarmConnection.tryLogin(username, password, config.tenant, loginCtor, false, loginCtor, errorHandler);
        }else{
			swarmConnection = new SwarmClient(config.host, config.port, username, password, config.tenant, loginCtor, errorHandler);
			for(var callback in callBacks){
				swarmConnection.on(callback, dispatchingCallback);
			}
        }
    }

	this.initConnection = function(loginCtor, username, password, expectedPhase, successHandler, errorHandler){
        doConnection.call(this, loginCtor, username, password, expectedPhase, successHandler, errorHandler);
	}

    var swarmSystemAuthenticated = false;
    var swarmConnectionCallbacks = [];

    function startWaitingCallbacks(){

        self.startSwarm =  swarmConnection.startSwarm.bind(swarmConnection);

        pendingCommands.forEach(function(args){
            var cmd = self.startSwarm.apply(self, args);
            for(var phaseName in cmd.pending){
                cmd.onResponse(phaseName,cmd.pending[phaseName] );
            }
        })
        pendingCommands = [];


        swarmConnectionCallbacks.forEach(function(i){
            i();
        })
        swarmConnectionCallbacks = [];
    }

    this.onSwarmConnection = function (callback) {
        if (swarmSystemAuthenticated) {
            callback();
        } else {
            if (callback) {
                swarmConnectionCallbacks.push(callback);
            }
        }
    };

	this.on("login.js", "success", startWaitingCallbacks);
    this.on("login.js", "restoreSucceed", startWaitingCallbacks);
}