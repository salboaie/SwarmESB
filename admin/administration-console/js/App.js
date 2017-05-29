var App = new function(){
	var config = new Config();
	var brandPlaceHolder = ".app-brand";
	
	this.init = function(){
		document.title = config.title;
		$(brandPlaceHolder).html(config.brand);

        var target = document.getElementsByName("app-content");
        //because getElementsByName returns array we take the first of them if available
        if(target){
            target = target[0];
        }

		var swarmHubMaster = new window.SwarmHub(target.contentWindow);
		var sessionController = new SessionController(swarmHubMaster);
		var menuController = new MenuController(swarmHubMaster);
		var notifications = new Notifications(swarmHubMaster);
	}
};

App.init();