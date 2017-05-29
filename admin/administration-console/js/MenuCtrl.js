function MenuController(hub) {
	$.notifyDefaults(NotifyCfg());

	var menu = [];
	var target = "#app-menu";
	var urlPlaceHolder = "%url%";
	var namePlaceHolder = "%name%";
	var iconPlaceHolder = "%icon%";
	var iframeSelector = "iframe[name='app-content']";

	var template = "<li>" +
		"<a href=\"" + urlPlaceHolder + "\" target=\"app-content\" class='auto'>" +
		"<i class='"+iconPlaceHolder+"' style='margin-right: 5px;'></i>" +
		"<span class=\"font-bold\">" + namePlaceHolder + "</span>" +
		"</a></li>";

	hub.on("MenuCtrl.js", "failed", function (swarm) {
		$.notify({
			icon: 'glyphicon glyphicon-warning-sign',
			message: "An error occured while getting menu list!"
		},{
			type: 'danger'
		});
	});

	hub.on("MenuCtrl.js", "gettingListDone", function (swarm) {
		menu = swarm.result;
		gotMenu(menu);
	});

	hub.startSwarm("MenuCtrl.js", "list");

	var gotMenu = function (menu) {

		var domTarget = $(target);
		for (var i = 0; i < menu.length; i++) {
			var item = menu[i];

			if(item.default){
				setDefaultApp(item.url);
			}

			var menuItem = template;
			menuItem = Utils.prototype.replaceAll(menuItem, urlPlaceHolder, item.url);
			menuItem = Utils.prototype.replaceAll(menuItem, namePlaceHolder, item.name);
			menuItem = Utils.prototype.replaceAll(menuItem, iconPlaceHolder, item.icon);
			domTarget.append(menuItem);
		}
	};

	function setDefaultApp(url){
		var iframe = $(iframeSelector);

		if(iframe.attr("src")==""){
			//we set default app only if there is nothing loaded in the iframe
			iframe.attr("src", url);
		}
	}

	DisplayAvatar(hub);
}


$(document).ready(function () {
	var toggles = $("[data-toggle]");
	var iframes = $("iframe");
	var mainIframe = iframes.get(0);
	var toggleTargets = [];

	toggles.each(function (index, element) {
		var dataTarget = $(element).attr('data-target');
		toggleTargets.push($(dataTarget));
	});

	function toggleOffElements(event) {
		var target = event.target;
		if (toggles.get().indexOf(target) == -1) {
			$(toggles).each(function (index, element) {
				var dataTarget = $(element).attr('data-target');
				switch ($(element).attr('data-toggle')) {
					case "dropdown":
						$(dataTarget).trigger('click.bs.dropdown');
						break;
					case "collapse":
						$(dataTarget).collapse('hide');
						break;
				}
			});
		}
	}

	$('html').click(toggleOffElements);
	$(mainIframe).load(function () {
		var ifr = $(mainIframe).contents();
		ifr.click(toggleOffElements);
	});
});