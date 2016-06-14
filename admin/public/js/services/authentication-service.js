angular.module('app')
    .factory("authenticationService", ["swarmService", "$cookieStore", function (swarmService, $cookieStore) {
        var loggedIn = false;
        var authenticatedUser = {};
        var instance = swarmHub.createObservable();

        return {
            authenticateUser: function (username, password, securityFn, errorFn, successFn) {
                var self = this;

                swarmService.initConnection("localhost", 8080, username, password, "swarmMonitor", "userLogin", securityFn, errorFn);

                swarmHub.on('login.js', "success", function (swarm) {
                    loggedIn = swarm.authenticated;
                    $cookieStore.put("sessionId", swarm.meta.sessionId);
                    $cookieStore.put("userId", swarm.userId);
                    self.setUser(swarm.userId);
                    successFn();

                    swarmHub.off("login.js","success");
                });
            },

            restoreUserSession: function (successCallback, failCallback) {
                var username =  $cookieStore.get("userId");
                var sessionId = $cookieStore.get("sessionId");
                var self = this;

                var errorCallback = function(){
                    //TODO
                    //some service that alert user
                }

                if(!username || !sessionId){
                    failCallback();
                }

                swarmService.restoreConnection(username, sessionId, failCallback, errorCallback);

                swarmHub.on('login.js', "restoreSucceed", function (swarm) {
                    loggedIn = true;
                    self.setUser(swarm.userId);
                    successCallback();
                    swarmHub.off("login.js","restoreSucceed");

                });
            },

            setUser:function(userId){
                swarmHub.startSwarm('UserInfo.js', 'info',userId);
                swarmHub.on('UserInfo.js', 'result', function (response) {
                    authenticatedUser = response.result;
                    instance.notify();
                    swarmHub.off("UserInfo.js","info");
                });
            },

            getCurrentUser: function(callback){
                instance.observe(function(){
                    callback(authenticatedUser);
                });
            },

            getStatus: function () {
                return loggedIn;
            },

            checkStatus: function (loggedInFn, notLoggedInFn) {
                this.restoreUserSession(loggedInFn, notLoggedInFn);
            },

            logoutCurrentUser:function(callback){
                swarmHub.startSwarm("login.js","logout");
                swarmHub.on("login.js", "logoutSucceed", function(swarm){
                    authenticatedUser = {};
                    loggedIn = false;
                    $cookieStore.remove("userId");
                    $cookieStore.remove("sessionId");
                    swarmHub.off("login.js","logoutSucceed");
                    swarmService.removeConnection();
                    callback();

                });
            }
        }
    }]);
