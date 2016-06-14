
var abhttps  = require("https-auto");
var https  = require("https");
var fs  = require("fs");
var connect  = require("connect");
var connectRoute = require('connect-route');
var request = require("request");
//var clientCertificateAuth = require('client-certificate-auth');



exports.createHttpsNode = function(port, keysFolder, filesFolder, relay, securityCheck, useMutual){
    console.log("Using keys folder ", keysFolder);

    var checkAuth = function(cert) {
        /*
         * allow access if certificate subject Common Name is 'Doug Prishpreed'.
         * this is one of many ways you can authorize only certain authenticated
         * certificate-holders; you might instead choose to check the certificate
         * fingerprint, or apply some sort of role-based security based on e.g. the OU
         * field of the certificate. You can also link into another layer of
         * auth or session middleware here; for instance, you might pass the subject CN
         * as a username to log the user in to your underlying authentication/session
         * management layer.
         */
        console.log("Checking");
        return true;
    };

    function smoothRetrieve(req,chunkCallback,endCallback){
        req.on("data",function(chunk){
            chunkCallback(chunk);
        });
        req.on("end",function(){
            endCallback();
        });
    }

    function retriveContent(req, callback){
        var bodyStr = "";
        req.on("data",function(chunk){
            bodyStr += chunk.toString();
        });
        req.on("end",function(){
            callback(null, bodyStr);
        });
    }


    if(!keysFolder){
        keysFolder = "tmp";
    }

    if(!filesFolder){
        filesFolder = "uploads";
    }

    if (!fs.existsSync(filesFolder)){
        fs.mkdirSync(filesFolder);
    }

    var app = connect();

    // gzip/deflate outgoing responses
    /*var compression = require('compression');
    app.use(compression());*/


    /*
    app.use(function(req,res, next){
        var cert = req.connection.getPeerCertificate();
        if(!securityCheck || securityCheck(cert)){
            next();
        } else {
            console.log("Security check failed!", cert);
        }

    }); */

    //app.use(clientCertificateAuth(checkAuth));

    app.use(connectRoute(function (router) {
        router.get('/', function (req, res, next) {
            console.log("Index hit");
            res.end('index');
        });


        router.post('/publish/:channel', function (req, res, next) {
            retriveContent(req, function(err, result){
                relay.dispatch(req.params.channel, result, function(err, counter){
                    res.end(""+counter);
                });
            });

        });

        router.post('/share/:transferId', function (req, res, next) {
            var filePath = filesFolder+"/"+req.params.transferId;
            smoothRetrieve(req, function(result){
                fs.appendFileSync(filePath,result);
            },function(){
                res.end('bye');
            });

            /*res.on("end", function(){
                console.log("Closing stream");
                wstream.close();
                res.end('bye');
            })*/
        });

        router.get('/share/:transferId', function (req, res, next) {
            var fileName = filesFolder+"/"+req.params.transferId;

            var readStream = fs.createReadStream(fileName);
            readStream.on('open', function () {
                // This just pipes the read stream to the response object (which goes to the client)
                readStream.pipe(res);
            });
            readStream.on('end', function () {
                res.end();
            });
            // This catches any errors that happen while creating the readable stream (usually invalid names)
            readStream.on('error', function(err) {
                res.end(err);
            });
        });

        router.delete('/share/:transferId', function (req, res, next) {
            var fileName = filesFolder+"/"+req.params.transferId;
            fs.unlink(fileName, function(err, result){
                res.end();
            });
        });
    }));

    if(useMutual){
        abhttps.startMutualAuthServer(port, keysFolder, app);
    } else {
        abhttps.startServer(port, keysFolder, app);
    }
    return app;
}


function ns_getOrganisation(keyFolder, orgName, callback){
    abhttps.lookup(keyFolder, orgName, callback);
    /*if(orgName == "ORG1"){
        callback(null, );
    } else {
        );
    }*/
}

function gradualRead(filePath,chunkSize,fileSize,chunkCallback,endCallback){

    fs.open(filePath, 'r', function(err, fd) {
        if (err) {
            console.log("Error while reading ",filePath, err);
        }

        function readNextChunk() {
            var buffer = new Buffer(chunkSize);
            fs.read(fd, buffer, 0, chunkSize, null, function(err, nread , readBuffer) {
                console.log("Reading ", nread, " bytes from ", filePath);
                if (err) {
                    console.log("Error while reading ",filePath, err);
                }

                /*var data = new Buffer(nread);
                readBuffer.copy(data,0,0, nread);*/

                if(nread > 0 ){
                    chunkCallback(readBuffer);
                }

                if (nread < chunkSize) {
                    fs.close(fd);
                    endCallback();
                    return ;
                }
                readNextChunk();
            });
        }
        readNextChunk();
    });
}

function doPost(options, fileName, resultCallback){
    var size,buf;
    if(fileName){
         size = fs.statSync(fileName).size;
    } else {
         buf = new Buffer(options.form);
         size = Buffer.byteLength(options.form);
    }
    options.headers =  {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'en-US,en;q=0.5',
            'User-Agent': 'PubSub Choreography 1.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': size
    }

    var req = https.request(options, function(res) {
        res.on('data', function(d) {
                    /*  console.log("Data:", d.toString());
                    */
            });
    });

    if(buf) {
        req.write(buf);
        req.end();
    }else{
        gradualRead(fileName,500*1024,size,req.write.bind(req),function(){
            if(resultCallback){
                resultCallback();
            }
            req.end();
        });
    }

    req.on('error', function(e) {
        console.log("Https POST request fail towards:",options.url, e);
    })
}


exports.pushMessage  = function(keysFolder, organisation, channel, strMessage){

    ns_getOrganisation( keysFolder, organisation, function(err, org){
        abhttps.getHttpsOptions(keysFolder, function(err, options){
            //options = {};

            options.rejectUnauthorized = false;
            options.requestCert        = true;
            options.agent              = false;

            options.hostname = org.server;
            options.port = org.port;
            options.url = "https://" + org.server + ":" + org.port + "/publish/" + channel;
            options.path = "/publish/" + channel;
            options.form = strMessage ;
            options.method = 'POST';
            //console.log(options);
            console.log('Pushing message towards ',options.url);
            doPost(options);
            //request.post(options);
        });
    })
}




exports.upload  = function(keysFolder, organisation, transferId, fileName, callback){
    ns_getOrganisation(keysFolder, organisation, function(err, org){
        abhttps.getHttpsOptions(keysFolder, function(err, options){
            options.rejectUnauthorized = false;
            options.requestCert        = true;
            options.agent              = false;

            options.hostname = org.server;
            options.port = org.port;
            options.url = "https://" + org.server + ":" + org.port + "/share/" + transferId;
            options.path = "/share/" + transferId;
            options.method = 'POST';
            doPost(options, fileName, callback);
        });
    })
}



exports.download  = function(keysFolder, transferId, organisation, fileName, callback){

    ns_getOrganisation(keysFolder, organisation, function(err, org) {
        abhttps.getHttpsOptions(keysFolder, function (err, options) {
            options.rejectUnauthorized = false;
            options.requestCert = true;
            options.agent = false;

            options.hostname = org.server;
            options.port = org.port;
            options.url = "https://" + org.server + ":" + org.port + "/share/" + transferId;
            options.path = "/share/" + transferId;
            options.method = 'GET';
            var writeStream = fs.createWriteStream(fileName);
            var req = https.get(options, function (res) {
                res.pipe(writeStream);
                res.on('end', function () {
                    writeStream.end();
                    console.log("Finishing download....");
                    callback();
                });
            });
            req.end();
        });
    });
}

exports.unshare  = function(keysFolder, transferId, organisation, callback){

    ns_getOrganisation(keysFolder, organisation, function(err, org) {
        abhttps.getHttpsOptions(keysFolder, function (err, options) {
            options.rejectUnauthorized = false;
            options.requestCert = true;
            options.agent = false;

            options.hostname = org.server;
            options.port = org.port;
            options.url = "https://" + org.server + ":" + org.port + "/share/" + transferId;
            options.path = "/share/" + transferId;
            options.method = 'DELETE';
            var req = https.get(options, function (res) {
                if(callback){
                    callback();
                }
            });
            req.end();
        });
    });
}

