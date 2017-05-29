function Utils(){}

Utils.prototype.replaceAll = function(target, placeHolder, content){
	var regex = new RegExp(placeHolder, 'g');
	return target.replace(regex, content);
}

Utils.prototype.isInFrame = function(){
	return window.frameElement && window.frameElement.nodeName == "IFRAME";
}

Utils.prototype.localStorageSupport = function(){
   return (typeof(Storage) !== "undefined");
}
