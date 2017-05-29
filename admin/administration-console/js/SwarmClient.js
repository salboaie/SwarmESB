/**********************************************************************************************
 * SwarmClient Class: web browser client, using websockets
 **********************************************************************************************/
var useSocketIo = true;

function SwarmClient(host, port, userId, authToken, tenantId, loginCtor, securityErrorFunction, errorFunction) {
    var self = this;
    var socket;
    var outletId = "";
    var sessionId = null;
    var loginOk = false;
    var pendingCmds = [];
    var callBacks = {};
    var apiVersion = '2.0';
    var currentFunction = waitingForIdentity;
    var connectionInProgress = false;
    var isConnected = false;
    var nrAttemptReconnect = 2;
    var currentAttemptToReconnect = 0;
    var connectionString;
    if(useSocketIo){
        connectionString ="http://"+host + ":" + port;
    }else{
        connectionString ="ws://"+host + ":" + port;
    }

    var requestHandleCount = {};


    this.getOutletId = function () {
        return outletId;
    }

    this.getSessionId = function () {
        return sessionId;
    }

    createSocket();

    function createSocket() {
        lprint("Creating a new socket");
        isConnected = false;
        if(useSocketIo){

            /*if(socket){
             socket = io.connect(null, {transports: ['websocket', 'polling', 'flashsocket'],
             'force new connection':true});
             } else {
             //TODO:implement all handlers
             'message'
             'connect'
             'disconnect'
             'open'
             'close'
             'error'
             'retry'
             'reconnect'
             }*/

            socket = io.connect(connectionString);
            socket.on('connect', socket_onConnect);
            socket.on('data', socket_onStreamData);
            socket.on('message', socket_onStreamData);
            socket.on('error', socket_onError);
            socket.on('connect_error', socket_onError);
            socket.on('disconnect', socket_onDisconnect);
            socket.on('retry', socket_onRetry);
            socket.on('reconnect', socket_onReconect);
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
        lprint("Socket connected");
        isConnected = true;
        getIdentity();
    }


    this.destroySocket = function(){
        lprint("Destroying a socket");
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

    this.logout = this.destroySocket;

    function socket_onError(err) {
        lprint("Unexpected socket error");
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

    var showingAlert = true;
    function socket_onDisconnect(err) {
        if(currentAttemptToReconnect < nrAttemptReconnect) {

            if (!useSocketIo) {
                try {
                    self.destroySocket();
                } catch (err) {
                    eprint("eroare IE ", err);
                }
                createSocket();
                //console.log("isConnected",currentAttemptToReconnect);
            }
        }
        setTimeout(function(){
            if(isConnected){
                currentAttemptToReconnect = 0;
            }else{
                currentAttemptToReconnect++
                if(currentAttemptToReconnect == nrAttemptReconnect){
                    if(!showingAlert){
                        showingAlert = true;
                        user_alert("Network connection is down. Click ok to connect!", function(){
                            showingAlert = false;
                            if(!useSocketIo){
                                try{
                                    self.destroySocket();
                                }catch(err){
                                    eprint("eroare IE ",err);
                                }
                                currentAttemptToReconnect = 0;
                                createSocket();
                            }
                        });
                    }
                }
            }
        }, 1000);
    }

    function socket_onRetry() {
        lprint("Socket Retry handler");

    }

    function socket_onReconect() {
        lprint("Unexpected socket reconnect");
        //getIdentity();
    }

    function socket_onStreamData(data) {
        lprint("Got swarm ", data);
        currentFunction(data);
    }

    this.tryLogin = function(__userId, __authToken, __tenantId, __loginCtor, recreateConnection, securityErrFn, errorFn){

        userId     = __userId;
        authToken  = __authToken;
        tenantId   = __tenantId;
        loginCtor  = __loginCtor;

        if(securityErrFn){
            securityErrorFunction = securityErrFn;
        }
        if(errorFn){
            errorFunction =  errorFn;
        }


        /*if(!isConnected){
         return;
         } */
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
                commandArguments: [userId, authToken]
            }
        };
        self.writeObject(cmd);
    }

    function waitingForIdentity(data) {
        if (data.meta && data.meta.command == "identity") {
            currentFunction = waitingForLogin;
            sessionId = data.meta.sessionId;
            apiVersion = data.meta.apiVersion;

            if (apiVersion !== "2.0") {
                lprint("Api version doesn't match !", "Api version error, 2.0 expected");
            }
            doLogin(userId, authToken, tenantId, loginCtor);
        }
    }



    function waitingForLogin(data) {
        var i;
        var command;
        var len;

        connectionInProgress = false;
        loginOk = data.authenticated;

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
        filter_onResult(data);
    }

    function callSwarmingCallBack(swarmingName, data) {
        var callbackList = callBacks[swarmingName];
        if (callbackList !== null && callbackList instanceof  Array) {
            for (var i = 0, len = callbackList.length; i < len; i++) {
                var callback = callbackList[i];
                try {
                    callback(data);
                }
                catch (e) {
                    eprint(e + " in swarm generated callback: " + callback ,e );
                }
            }
        }
    }

    function getIdentity() {
        lprint("Preparing for communication...");
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

    var requestCounter = 0;
    function createRequestIdentity(){
        requestCounter++;
        return outletId + "/" + requestCounter;
    }

    var counter = 0;
    var filters = {};

    this.template_onResponse = function(phaseName, callback){
        filters[this.meta.requestId + phaseName] = callback;
    }

    function filter_onResult(data){
        var name = data.meta.requestId + data.meta.currentPhase;
        var callback = filters[name];
        if(callback){
            callback(data);
        }
    }

    this.startSwarm = function (swarmName, ctorName) {
        var cmd;
        counter++;
        var requestId = outletId + counter;
        if(typeof swarmName !== "string"){
            cmd = swarmName;
            swarmName = swarmName.meta.swarmingName;
        } else {
            var cmd = {

            };
            cmd.onResponse = this.template_onResponse.bind(cmd);
        }
        var args = Array.prototype.slice.call(arguments,2);
        for(var i=0;i<args.length; i++ ){
            if(objectIsShapeSerializable(args[i])){
                args[i] = args[i].getInnerValues();
            }
        }

        var meta =  {
            sessionId: sessionId,
            processIdentity:createRequestIdentity(),
            swarmingName: swarmName,
            tenantId: tenantId,
            outletId: outletId,
            command: "start",
            ctor: ctorName,
            commandArguments: args,
            requestId:requestId
        }

        cmd.meta = meta;

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

        if(useSocketIo ){
            if (socket) {
                lprint("Emiting: ", value);
                socket.emit('message', value);
            }
        } else {
            socket.send(J(value));
        }
    }
}


if(typeof(objectIsShapeSerializable) == "undefined"){
    objectIsShapeSerializable = function(){
        return false;
    }
}
