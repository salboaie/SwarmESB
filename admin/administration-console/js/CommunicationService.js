function CommunicationService(){
}

(function(){
	function MessageExchange(target){
		var channels = {};
		var initialized = false;
		
		function messageListener(event){

			if(event.target === event.source){
				//it means that we should ignore this message
				return;
			}

			var message = event.data;
			var channelName = message.name;
			
			/*TODO: test origin once figure it out and removed "*" from send! 
			if(event.origin === hostname)
				... */
			
			var callbacks = channels[channelName];
			if(callbacks){
				callbacks.forEach(function(callback) {
					callback(message.data);
				});
			}else{
				cprint("Warning: [CommunicationService] nobody listens on channel " + channelName);
			}
		}
		
		var subscribe = function(callback){
			var handler = callback || messageListener;

			if (window.addEventListener){
                window.addEventListener("message", handler, false);
			} else {
                window.attachEvent("onmessage", handler);
			}
		};
		
		this.unsubscribeFromChannel = function(name, callback){
			if(channels[name]){
				var index = channels[name].indexOf(callback);
				if(index!=-1){
					channels[name].splice(index, 1);
				}
			}else{
				cprint("Warning: [CommunicationService] There are no subscriptions to this channel!");
			}
		}
		
		this.unsubscribe = function(callback){
			if(callback){
				if (window.addEventListener){
					window.addEventListener("message", callback, false);
				} else {
                    window.attachEvent("onmessage", callback);
				}
			}
		}

		/*
			This function should be used only from HubMaster
		*/
		this.subscribe = function(callback){
			if(!callback){
				cprint("Warning: [CommunicationService] no callback set!");
				return;
			}
			subscribe(callback);
			initialized = true;
		}
		
		/* 
			This function allows HubSlave register callbacks to get responses for the sent swarms
		*/
		this.subscribeToChannel = function(name, callback){
			if(!name){
				cprint("Warning: [CommunicationService] no channel name provide to listen!");
				return;
			}
			
			if(!channels[name]){
				channels[name] = [callback];
			}else{
				channels[name].push(callback);
			}
			
			if(!initialized){
				subscribe();
				initialized = true;
			}
		}
		
		publish = function(data){
			//target.postMessage(data, "*");
			target.postMessage(data, window.location.protocol + '//' +window.location.host);
		}
		
		/*
			This function allows HubSlave to call swarms from the startSwarm method
		*/
		this.publishToChannel = function(name, data){
			var message = {
				"name": name,
				"data": data
			}
			publish(message);
		}
	}
	
	/*
		Function used by HubMaster and HubSlave to initiate a communication between them
	*/
	CommunicationService.prototype.getHubConnection = function(domClosure){
		if(!domClosure){
			console.log("Warning: [CommunicationService] no target provided!");
			return;
		}
		
		var connection = new MessageExchange(domClosure);
		return connection;
	}
})();