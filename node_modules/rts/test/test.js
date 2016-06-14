var redis = require('redis');
var client = redis.createClient();
var rts = require('../lib/rts')({
        redis: client
      , gran: '5m, 1h, 1d, 1w'
      , points: 500
      , prefix: 'test'
      , interval: 1000
});

var H = 60 * 60 * 1000;
var D = 24 * H;
var t = Date.now() - 1000 * H;
var from = t;

function record(timestamp, name, num, statistics, aggregations, callback) {
    rts.record(name, num, statistics, aggregations, timestamp, callback);
}

function recordUnique(timestamp, name, uniqueId, statistics, aggregations, callback) {
    rts.recordUnique(name, uniqueId, statistics, aggregations, timestamp, callback);
}

function _log(message) {
    return function log(err, results) {
        console.log(message, err, results);
    }
}
setTimeout(function() {
// var timer = setInterval(function() {
    for(var i=0;i<1000;i++) {
      t += Math.random() * 60 * 1000;
      recordUnique(t, 'access', 'u' + Math.floor(Math.random() * 100));
      record(t, 'click');
      record(t, 'delay', Math.random() * 101, ['min', 'max', 'avg']);
      record(t, 'consume', Math.random() * 1000, ['avg', 'min', 'max', 'sum'], ['dy', 'hq']);
    }
// }, 10);
}, 100);

setTimeout(function() {
        rts.unique('access', '5m', from, from + 5* H, _log('access 5m'));
        rts.unique('access', '1h', from, from + 24* H, _log('access 1h'));
        rts.unique('access', '1d', from, from + 5 * D, _log('access 1d'));
        rts.sum('click', '5m', from, from + H,  _log('click 5m'));
        // even not store, also can get, but zero results;
        rts.sum('click', '8m', from, from + H,  _log('click 8m'));
        rts.sum('click', '1d', from, from + 30 * D, _log('click 1d'));
        rts.avg('delay', '1h', from, from + 24 * H, _log('delay 1h avg'));
        rts.max('delay', '1w', from, from + 365 * D, _log('delay 1w max'));
        rts.aggrmin('consume', 'dy', from, _log('consume dy'));
        rts.aggravg('consume', 'hq', from, _log('consume hq'));
        // clearInterval(timer);
        rts.stop()
        client.unref()
}, 1000);

