/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */


/*
 Cod Preluat din proiectul open source swam monitor. Nu e folosit momentan de
 */

var core = require ("swarmcore");
thisAdapter = core.createAdapter("SMSAdapter");

var request = require('request');

var config = getMyConfig('SMSAdapter');
var connectionId = config.connectionId;
var password = config.password;

var makeURL = function(phone, message) {
    return 'http://www.smslink.ro/sms/gateway/communicate/?connection_id=' + 
        connectionId +'&password=' + password +
        '&message=' + message + '&to=' + phone;
};

sendMessage = function (phone, message) {
    if (phone && message) {
        var url = makeURL(phone, message);
        if (config.enabled) {
            console.log('Sending message: ' + phone + ' | ' + message);
            request
                .get(url)
                .on('error', function(err){
                    console.log(err);
                });
        } else {
            console.log('Fake send message: ' + phone + ' | ' + message);
        }
    }
};
