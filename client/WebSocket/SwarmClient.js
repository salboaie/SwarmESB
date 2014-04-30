
/**********************************************************************************************
 * SwarmClient Class: web browser client. Provided like example. Modify in your application as requested
 **********************************************************************************************/
var useSocketIo = false;

function SwarmClient(host, port, userId, authToken, tenantId, loginCtor, securityErrorFunction, errorFunction) {
    var self = this;
    var socket;
    var outletId = "";
    var sessionId = null;
    var loginOk = false;
    var pendingCmds = [];
    var callBacks = {};
    var apiVersion = '1.1';
    var currentFunction = waitingForIdentity;
    var connectionInProgress = false;
    var isConnected = false;

    var connectionString;
    if(useSocketIo){
        connectionString ="http://"+host + ":" + port;
    }else{
        connectionString ="ws://"+host + ":" + port;
    }

    //TODO : Websockets apparently send message twice (sometimes)
    // see : https://github.com/LearnBoost/socket.io/issues/997
    var requestHandleCount = {};


    this.getOutletId = function () {
        return outletId;
    }

    this.getSessionId = function () {
        return sessionId;
    }


    createSocket();



    function createSocket() {
        isConnected = false;
        if(useSocketIo){
            if(socket){
                socket = io.connect(null, {'force new connection':true});
            } else {
                //TODO:implement all handlers
                /*
                 'message'
                 'connect'
                 'disconnect'
                 'open'
                 'close'
                 'error'
                 'retry'
                 'reconnect'
                 */
                socket = io.connect(connectionString);
                socket.on('connect', socket_onConnect);
                socket.on('data', socket_onStreamData);
                socket.on('error', socket_onError);
                socket.on('disconnect', socket_onDisconnect);
                socket.on('retry', socket_onRetry);
                socket.on('reconnect', socket_onReconect);
            }
        } else {
            dprint("Connecting to the Web Socket server: ", connectionString);
            socket = new WebSocket(connectionString);
            socket.onmessage =   function(data){
                socket_onStreamData(JSON.parse(data.data));
            }
            socket.onerror   =  socket_onError;
            socket.onclose   =  socket_onDisconnect;
            socket.onopen   =  socket_onConnect;

            setTimeout(function(){
                     if(socket.readyState != 1){
                         socket.onerror();
                     }
            }, 1000);
        }

    }

    function socket_onConnect(){
        isConnected = true;
        getIdentity();
    }


    this.destroySocket = function(){
        if(useSocketIo){
            delete socket;
            delete this;
        } else {

            socket.onerror = function(){};
            socket.onclose = socket.onerror;
            socket.onopen  = socket.onerror;

            socket.close();
            delete socket;
        }

    }

    function socket_onError(err) {
        if(err){
            eprint("Socket error", err);
        }
        if(errorFunction){
            errorFunction(err);
        }else{
            lprint("socket_onError handler");
        }
        socket_onDisconnect();
    }

    var showingAlert = false;
    function socket_onDisconnect(err) {
        /*if(errorFunction){
            errorFunction(err);
        }else{

        }*/
        //if(isConnected){
        if(!showingAlert){
            showingAlert = true;
            shape.alert("Network connection is down. Click ok to connect!", function(){
                showingAlert = false;
                if(!useSocketIo){
                   try{
                       self.destroySocket();
                    }catch(err){
                       eprint("eroare IE ",err);
                   }

                    createSocket();
                }
            });
        }

    }



    function socket_onRetry() {
        lprint("socket_onRetry handler");

    }

    function socket_onReconect() {
        //lprint("socket_onReconect handler");
        //getIdentity();
    }

    function socket_onStreamData(data) {
        if(data.swarmDataGotProcessed){
            lprint("Wtf!?????????????????????");
        } else {
            data.swarmDataGotProcessed = true;
            lprint("Got swarm ", data.meta.swarmingName, " phase ", data.meta.currentPhase);
            currentFunction(data);
        }
    }


    this.tryLogin = function(__userId, __authToken, __tenantId, __loginCtor, recreateConnection){

        userId     = __userId;
        authToken  = __authToken;
        tenantId   = __tenantId;
        loginCtor  = __loginCtor;

        if(!isConnected){
            return;
        }
        if(useSocketIo){
            if(recreateConnection) {
                createSocket();
            }
            getIdentity();
        } else {
            //this.destroySocket();
            createSocket();
        }

    }


    function doLogin(){
        var cmd = {
            meta: {
                swarmingName: "login.js",
                command: "start",
                ctor: loginCtor,
                tenantId: tenantId,
                commandArguments: [sessionId, userId, authToken]
            }
        };
        self.writeObject(cmd);
    }

    function waitingForIdentity(data) {
        if (data.meta && data.meta.command == "identity") {
            currentFunction = waitingForLogin;
            sessionId = data.meta.sessionId;
            apiVersion = data.meta.apiVersion;

            if (apiVersion !== "1.1") {
                lprint("Api version don't match !", "Api version error");
            }

            doLogin(userId, authToken, tenantId, loginCtor);
        }
    }



    function waitingForLogin(data) {
        var i;
        var command;
        var len;

        connectionInProgress = false;
        loginOk = data.isOk;

        if (loginOk) {
            outletId = data.meta.outletId;
            sessionId = data.meta.sessionId;
            currentFunction = socket_onDataReady;
            loginOk = true;

            for (i = 0; len = pendingCmds.length, i < len; i++) {
                command = pendingCmds[i];
                command.meta.sessionId = sessionId;
                command.meta.outletId = outletId;
                self.writeObject(command);
            }

            pendingCmds = [];
            callSwarmingCallBack(data.meta.swarmingName, data);
        }
        else {
            if(securityErrorFunction){
                securityErrorFunction(data.meta.currentPhase, data);
            } else {
                lprint("Login failed !", "Login failed : authorisationToken:[" + data.authorisationToken + "] userId:[" + data.userId + "]");
            }
        }
    }

    function socket_onDataReady(data) {
        if (data && data.meta && data.meta.changeSessionId == true) {
            sessionId = data.meta.sessionId;
        }

        callSwarmingCallBack(data.meta.swarmingName, data);
    }

    function callSwarmingCallBack(swarmingName, data) {
        var callbackList = callBacks[swarmingName];
        if (callbackList !== null && callbackList instanceof  Array) {
            for (var i = 0, len = callbackList.length; i < len; i++) {
                var callback = callbackList[i];
                try {
                    shapePubSub.blockCallBacks();
                    callback(data);
                    shapePubSub.releaseCallBacks();
                }
                catch (e) {
                    eprint(e + " in swarm generated callback: " + callback ,e );
                }
            }
        }
    }

    function getIdentity() {
        lprint("Preparing for communication...");
        /* if (connectionInProgress) {
            return;
        } */
        connectionInProgress = true;
        outletId = "";
        sessionId = null;
        loginOk = false;
        pendingCmds = [];
        currentFunction = waitingForIdentity;
        var cmd = {
                meta: {
                    swarmingName: 'login.js',
                    command: 'getIdentity',
                    ctor: 'authenticate'
                }
            };
        self.writeObject(cmd);
    }


    this.startSwarm = function (swarmName, ctorName) {
        var args = Array.prototype.slice.call(arguments,2);
        for(var i=0;i<args.length; i++ ){
            if(objectIsShapeSerializable(args[i])){
                args[i] = args[i].getInnerValues();
            }
        }
        var cmd = {
            meta: {
                sessionId: sessionId,
                swarmingName: swarmName,
                tenantId: tenantId,
                outletId: outletId,
                command: "start",
                ctor: ctorName,
                commandArguments: args
            }
        };

        if (loginOk == true) {
            self.writeObject(cmd);
        }
        else {
            pendingCmds.push(cmd);
        }
        return cmd;
    }

    this.on = function (swarmingName, callback) {
        if (!callBacks[swarmingName]) {
            callBacks[swarmingName] = [];
        }
        this.off(swarmingName, callback);
        callBacks[swarmingName].push(callback);
    }

    this.off = function (swarmingName, callback) {
        var callbackList = callBacks[swarmingName];
        if (callbackList !== null) {
            for (var i = 0, len = callbackList.length; i < len; i++) {
                var c = callbackList[i];
                if (callback === c) {
                    callbackList.splice(i, 1);
                    return;
                }
            }
        }
    }

    this.writeObject = function (value) {
        lprint("Swarm ctor: ", value.meta.swarmingName, "  ", value.meta.ctor);
        if(useSocketIo ){
            if (socket) {
                socket.emit('data', value);
            }
        } else {
            socket.send(J(value));
        }
    }
}

/**********************************************************************************************
 * Util Functions
 **********************************************************************************************/

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 8 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return "0x" + hex;
}