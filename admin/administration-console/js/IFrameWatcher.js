(function IFrameWatcher(){
	var config = Config();

	//if not desired
	if(!config.urlSync){
		return;
	}

	var frameSelector = "[name=\"app-content\"]";
	var watchedFrame = $(frameSelector);

	var urlsVault = [];

	var ignoreThisFrameLoad = false;
	var ignoreThisFragmentChange = false;

	watchedFrame.load(function(event){
		if(!ignoreThisFrameLoad){
			var url = watchedFrame.get(0).contentWindow.location.href;
			storeUrl(url);
			ignoreThisFragmentChange = true;
		}
		ignoreThisFrameLoad = false;
	});

	window.onhashchange = function(event){
		if(!ignoreThisFragmentChange){
			syncIFrame();
		}
		ignoreThisFragmentChange = false;
	}

	function storeUrl(url){
		window.location.hash = url;
		//if vault is full...
		if(urlsVault.length == config.urlHistorySize){
			//drop first item to make space
			urlsVault.shift();
		}
		urlsVault.push(url);
	}

	function readUrl(){
		var url = window.location.hash;
		url = url.substr(1);
		return url;
	}

	function syncIFrame(){
		var url = readUrl();
		ignoreThisFrameLoad = true;
		watchedFrame.attr('src', url);
	}

	//initial sync after refresh
	syncIFrame();
})();
