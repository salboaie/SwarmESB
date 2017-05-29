function Notifications(hub){
	var config = Config();

	if(config && config.mobileDebug){
		mobileDebugInit();
		return;
	}

	if(!config || !config.notification || !cordova) {
		return;
	}

	function getDevice(){
		if(config && config.mobileDebug){
			return {
				uuid: "1234678514",
				platform: "Android"
			}
		}else{
			return device;
		}
	}

	function registerDevice(registrationId){
		var deviceUuid = getDevice().uuid;
		var platform = getDevice().platform;
		if(registrationId){
			hub.startSwarm("Notifications.js", "register", deviceUuid, registrationId, platform);
			hub.on("Notifications.js", "registrationDone", function(swarm){
				//todo
				console.log("registrationDone", swarm);
			});
			hub.on("Notifications.js", "registrationFailed", function(swarm){
				//todo
				console.log("registationFailed", swarm);
			});
		}
	}

	function displayNotification(notification){
		//todo display notification
		$.notify({
			icon: 'glyphicon glyphicon-ok',
			message: notification.message
		}, {
			type: 'success'
		});
	}

	function init(){
		document.addEventListener("deviceready", function(){
			if(PushNotification){
				var push = PushNotification.init(config.notification);

				push.on('registration', function(data) {
					var registrationId = data ? data.registrationId : undefined;
					console.log("RegistrationId", registrationId);
					registerDevice(registrationId);
				});

				push.on('notification', function(data) {
					// data.message,
					// data.title,
					// data.count,
					// data.sound,
					// data.image,
					// data.additionalData
					console.log("Notification received");
					displayNotification(data);
				});

				push.subscribe("news", function(data){
					console.log("Subscribe done");
				}, function(err){
					console.log("Subscribe failed");
				})

				push.on('error', function(e) {
					console.log("Error", e.message);
				});
			}else{
				console.log("Missing notification plugin");
			}
		}, false);
	}

	init();

	function mobileDebugInit(){
		registerDevice("cJgpGj49rfM:APA91bFiH7g1Ch79DQW1_Z_k01eCeYOx2Y76yWUWBfgQ-48UI-bZDkc6YiWsmpBAuA_2g9zwAlHgQMTJ1LxGInjvQDE1wc5-vDDI0AvxAk4spA3EFsh1DXL5SbY3tSVJ64A6pvZvpix_");
	}
}