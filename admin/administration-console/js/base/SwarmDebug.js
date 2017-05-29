/*
    Functii de debug necesare pentru SwarmClient
 */

lprint = function(){
    console.log.apply(console, arguments);
}


eprint = function(){
    console.log.apply(console, arguments);
}

cprint = function(){
    console.log.apply(console, arguments);
}


user_alert = function(message, callback){
    alert(message);
    console.log("callback...");
    callback();
}