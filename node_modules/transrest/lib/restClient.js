
var http = require("http");
var url  = require("url");

var logger = require("double-check").logger;

function pRequest(method, myurl, buffer, callback) {
    var options = {};
    var size,buf;
    method = method.toUpperCase();
    options.method = method;
    var srvUrl = url.parse(myurl);
    options.port    = srvUrl.port;
    options.hostname = srvUrl.hostname;
    options.path = srvUrl.path;
    var writing = (method == 'POST' || method == 'PUT');
    if(writing){

        buf = new Buffer(buffer);
        size = Buffer.byteLength(buffer);
        options.headers =  {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'en-US,en;q=0.5',
            'User-Agent': 'SwarmESB RestClient',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': size
        }

    }

    var req = http.request(options, function(res) {
        var str = '';

        res.on('data', function(data) {
            str += data;
        });

        res.on('end', function() {
            callback(null, str);

        });
        res.on('error', function(err) {
            logger.error("Http request response fail towards:" + options, err);
            callback(err);
        });
    });

    if(writing){
        req.write(buf);
    }

    req.end();

    req.on('error', function(e) {
        logger.error("Http request fail:" + options.hostname + ":" + options.port , e);
    })
}

function RestClient(){
    this.get        = function (myurl,callback){
        pRequest('GET', myurl, undefined, callback);
    }

    this.getObject        = function (url,callback){
        this.get(url, function(err, res){
            try{
                if(err) {
                    throw err;
                } else {
                    callback(null, JSON.parse(res));
                }
            }catch(error){
                callback(error);
            }
        })
    }

    this.putObject    = function (url,obj, callback){
        pRequest('PUT', url, JSON.stringify(obj), callback);
    }

    this.postObject    = function (url,obj, callback){
        pRequest('POST', url, JSON.stringify(obj), callback);
    }

    this.delete    = function (url, callback){
        pRequest('DELETE', url, undefined, callback);
    }

    this.request = pRequest;
}

exports.getRestClient = function(){
    return new RestClient();
}



