
// helper functions
exports.decimalToHex = function (d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 8 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return "0x" + hex;
}

var READ_SIZE = 1;
var READ_JSON = 3;

var JSONMAXSIZE_CHARS_HEADER = 11; //8+3    // 0xFFFFFFFF\n is the max size    : 0x00000001\n is the min size, ( not a valid JSON!)

/**
 * Parser used in SwarmClient
 * @param callBack
 * @constructor
 */
function FastJSONParser(callBack) {
    this.state = READ_SIZE;
    this.buffer = "";
    this.nextSize = 0;
    this.callBack = callBack;
}

/**
 * Add data in parser and when a valid JSON is read, the callBack get called
 * @param data
 */
FastJSONParser.prototype.parseNewData = function (data) {
    this.buffer += data;
    var doAgain = true;
    while (doAgain) {
        doAgain = false;
        if (this.state == READ_SIZE) {
            if (this.buffer.length >= JSONMAXSIZE_CHARS_HEADER) {
                this.nextSize = parseInt(this.buffer.substr(0, JSONMAXSIZE_CHARS_HEADER));
                this.buffer = this.buffer.substring(JSONMAXSIZE_CHARS_HEADER);
                this.state = READ_JSON;
            }
        }

        if (this.state == READ_JSON) {
            if (this.buffer.length >= this.nextSize) {
                var json = JSON.parse(this.buffer.substr(0, this.nextSize));
                this.callBack(json);
                this.buffer = this.buffer.substring(this.nextSize + 1); // a new line should be passed after json
                doAgain = true;
                this.state = READ_SIZE;
            }
        }
    }
}

/**
 * Write an JSON prefixed by length in the socket
 * @param sock
 * @param object
 */
exports.writeObject = function (sock, object) {
    var str = JSON.stringify(object);
    exports.writeSizedString(sock, str);
}

/**
 *
 * @param sock
 * @param str
 */
exports.writeSizedString = function (sock, str) { //write size and JSON serialised form of the object
    var sizeLine = exports.decimalToHex(str.length) + "\n";
    sock.write(sizeLine + str + "\n");
    dprint("Writing to socket: " + str);
}

exports.createFastParser = function (callBack) {
    return new FastJSONParser(callBack);
}