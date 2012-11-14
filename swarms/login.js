
var loginSwarming =
{
    meta:{
        debug: true,
        renameSession:false
    },
    vars:{
        isOk:false
    },
    testCtor:function(clientSessionId,userId,authorisationToken){
        //this.loginTimeOut = this.timeoutSwarm(2000,"checkLoginTimeout","ClientAdapter");
        this.isOk               = false;
        this.setSessionId(clientSessionId);
        this.userId             = userId;
        this.authorisationToken = authorisationToken;
        this.swarm("check");

    },
    testForceSessionId:function(clientSessionId,userId,authorisationToken){
        this.identity = generateUID();
        this.isOk               = false;
        this.setSessionId(clientSessionId);
        this.userId             = userId;
        this.forceSessionId     = authorisationToken;
        this.swarm("checkForcedSessionValidity");
    },
    authenticate:function(clientSessionId, userId, authorisationToken){
        this.identity = generateUID();
        this.isOk               = false;
        this.setSessionId(clientSessionId);
        this.userId             = userId;
        this.authorisationToken = authorisationToken;
        //console.log('Auth request for token ' + authorisationToken);
        this.swarm("validateAuth");
    },
    validateAuth:{
        node: "Core",
        code: function() {
            var http = require('http');
            var self = this;
            var config = getMyConfig();
            var authServiceURL = config['authPath'] ? config['authPath'] : '';
            authServiceURL = authServiceURL.replace('[token]', self.authorisationToken);
            var params = {
                host: config['authHost'],
                port: config['authPort'],
                path: authServiceURL,
                method: 'GET'
            };

            var request = http.request(params, function(response){
                var buffers = [];

                response.addListener('data', function (chunk) {
                    buffers.push(chunk);
                });

                response.addListener('end', function () {
                    var responseData = Buffer.concat(buffers);
                    try {
                        var authResponse = JSON.parse( responseData.toString() );

                        if (authResponse.hasOwnProperty('error')) {
                            this.swarm("failed");
                        } else {
                            this.isOk = true;
                            //this.userId = authResponse['screenName'];
                            this.authorization = authResponse;
                            this.forceSessionId = authResponse['token'];
                            //console.log('Login success for ' + this.userId);
                            this.swarm("renameSession");
                        }
                    } catch (err) {
                        logErr('Authorization response invalid: ');
                        logErr(responseData);
                        this.swarm("failed");
                    }
                }.bind(self));

                response.addListener('error', function(error){
                    //log error
                    //console.log('Login failed \n' + error);
                    this.swarm("failed");
                }.bind(self));
            });

            request.addListener('error', function(error){
                //log error
                //console.log('Login failed \n' + error);
                this.swarm("failed");
            }.bind(self));

            request.end();
        }
    },
    check:{
        node:"Core",
        code : function (){
            //cprint("Login passed!");
            if(this.authorisationToken == "ok"){
                this.isOk = true;
                this.swarm("success");
            }
            else{
                this.swarm("failed");
            }
        }
    },
    checkForcedSessionValidity:{
        node:"Core",
        code : function (){
            if(this.forceSessionId == "testSession"){
                this.isOk = true;
                this.swarm("renameSession");
            }
            else{
                this.swarm("failed");
            }
        }
    },
    renameSession:{
        node:"ClientAdapter",
        code : function () {
            renameSession(this.currentSession(),this.forceSessionId, function(){
                this.setSessionId(this.forceSessionId);
                this.meta.changeSessionId = true;
                //console.log('Session set for ' + this.userId + ' [' + this.getSessionId() + ']');
                this.swarm("success");
            }.bind(this));
        }
    },
    success:{   //phase
        node:"ClientAdapter",
        code : function (){
            //this.deleteTimeoutSwarm(this.loginTimeOut);
            logInfo("Successful login for user " + this.userId);
            var outlet = findOutlet(this.getSessionId());
            outlet.successfulLogin(this);
            this.swarm("home",this.getSessionId());
            outlet.loginSucces = true;
        }
    },

    home:{   //phase executed on client
        node:"$client",
        code : null
    },

    checkLoginTimeout:{   //phase
        node:"ClientAdapter",
        code : function (){
            var outlet = findOutlet(this.getSessionId());
            cprint("Timeout for Outlet " + outlet.getSessionId() + " Succes:" + outlet.loginSucces );
        }
    },
    failed:{   //phase
        node:"ClientAdapter",
        code : function (){
            this.deleteTimeoutSwarm(this.loginTimeOut);
            logInfo("Failed login for " + this.userId );
            this.swarm("failed",this.getSessionId());
            findOutlet(this.getSessionId()).close();
        }
    },
    onErrorPhase:{
        node:"*",
        code : function (){
            cprint("Error on safe swarming");
        }
    }
};

loginSwarming;