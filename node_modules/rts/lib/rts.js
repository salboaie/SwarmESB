// vim: sw=4 et
// All Records example of 'foo_sth'
// _rts:foo_sth:5m:12345 sum 100
// _rts:foo_sth:5m:12345 count 100
// _rts:foo_sth:5m:12345 avg 100
// _rts:foo_sth:5m:12345 min 100
// _rts:foo_sth:5m:12345 max 100
// _rts:foo_sth:aggr.h:23 sum 100
// _rts:foo_sth:aggr.d:6 avg 100

var CHANNEL = '_rts_.record';
var util = require('./util');
var fs = require('fs');
var scripts = {};
var scriptSha1s = {};
['avg', 'max', 'min', 'update_pf'].forEach(function(key) {
        scripts[key] = fs.readFileSync(__dirname + '/' + key + '.lua', 'utf-8');
})

function loadScripts(client) {
    for(var scriptName in scripts) {
        (function(scriptName) {
                client.script('load', scripts[scriptName], function(err, sha1) {
                        if(sha1) scriptSha1s[scriptName] = sha1;
                })
        })(scriptName);
    }
}

function evalScript(client, scriptName, keys, args, callback) {
    if(scriptSha1s[scriptName]) {
        var args = [scriptSha1s[scriptName], keys.length].concat(keys || []).concat(args || [])
        if(callback) {
            args.push(callback)
        }
        client.evalsha.apply(client, args)
    } else {
        var args = [scripts[scriptName], keys.length].concat(keys || []).concat(args || [])
        if(callback) {
            args.push(callback)
        }
        client.eval.apply(client, args)
    }
}

var aggrvals = {
    h: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
  , d: [0,1,2,3,4,5,6]
}

function log(err, results) {
    if(err) console.log(err.stack || err);
}

/**
 * Create a rts instance
 *
 * @param {Object} options
 *          redis:
 *          gran: comma seprate string
 *          points: how many points store
 *          interval: update interval for pflog
 *          prefix: a prefix for all keys
 *
 */
var exports = module.exports = function rts(options) {
    var redis = options.redis
      , granularities = options.gran || '5m, 1h, 1d, 1w'
      , prefix = options.prefix || ''
      , points = options.points || 500
      , interval = options.interval || 60000;
      ;

    loadScripts(redis);

    prefix = '_rts_' + prefix;

    var keyPFKeys = prefix + ':pfkeys';

    granularities = granularities.split(',').map(util.getUnitDesc);
    var granMap = {};
    granularities.forEach(function(granInfo) {
            granMap[granInfo[1]] = granInfo;
    });

    function getGranKey(name, gran, timestamp) {
        var granId = util.getGranId(gran, timestamp);
        return [prefix, name, gran[1], granId].join(':');
    }

    function getAggrGruopKey(name, aggr, timestamp) {
        var gid = util.getAggrGroupId(aggr, timestamp);
        return [prefix, name, 'aggr', gid].join(':');
    }

    function getAggrKey(name, aggr, timestamp) {
        var aggrId = util.getAggrId(aggr, timestamp);
        return getAggrGruopKey(name, aggr, timestamp) + '.' + aggrId;
    }

    // some thing's some statics value in some granularity at some time
    function setValue(name, stat, value, gran, timestamp, callback) {
        if(typeof gran == 'string') {
            gran = util.getUnitDesc(gran)
        }
        var key = getGranKey(name, gran, timestamp);
        redis.hset(key, stat, value, callback)
    }

    /**
     * record behavior.
     * @param statistics {Array} sum, max, min, count, avg
     * @param aggregations {Array} dy (day in week each year), hm(hour of day each month).
     *
     */
    function record(name, num, statistics, aggregations, timestamp, callback) {
        timestamp = timestamp || Date.now();
        function recordStats(key) {
            statistics && statistics.forEach(function(stat) {
                    if(stat == 'sum') {
                        multi.hincrby(key, 'sum', num)
                    } else if(scripts[stat]){
                        evalScript(multi, stat, [key, num],[],function(err, result) {
                                if(err) throw err;
                                if(result && result.indexOf('ERR') == 0) {
                                    // console.log(scripts[stat]);
                                    throw new Error(result);
                                }
                        })
                    }
            });
        }
        if(!statistics) statistics = ['sum'];
        if(num == undefined) num = 1;

        var multi = redis.multi();

        granularities.forEach(function(gran) {
                var key = getGranKey(name, gran, timestamp);
                recordStats(key);
                var unitPeriod = gran[0];
                multi.expire(key, points * unitPeriod / 1000);
        });

        if(aggregations) for(var i = 0; i < aggregations.length; i++) {
            var aggr = aggregations[i];
            var key = getAggrKey(name, aggr, timestamp);
            recordStats(key);
        }

        multi.exec(callback || log);
    }

    /**
     * record unique access, like unique user of a period time.
     * @param {string | Array} uniqueId one or some uniqueId to be stats
     */
    function recordUnique(name, uniqueId, statistics, aggregations, timestamp, callback) {
        timestamp = timestamp || Date.now();
        // normal record
        if(statistics) {
            var num = Array.isArray(uniqueId) ? uniqueId.length : 1;
            record(name, num, statistics, aggregations, timestamp);
        }
        // record unique
        var multi = redis.multi();
        granularities.forEach(function(gran) {
                var key = getGranKey(name, gran, timestamp);
                var expireTime = util.getExpireTime(gran, timestamp);
                var pfkey = key + ':pf';
                multi.hset(keyPFKeys, pfkey, expireTime);
                if(Array.isArray(uniqueId)) {
                    multi.pfadd.apply(multi, [pfkey].concat(uniqueId));
                } else {
                    multi.pfadd(pfkey, uniqueId);
                }
                // recordStats(key);
                var unitPeriod = gran[0];
                multi.hincrby(key, 'uni', 0);
                multi.expire(key, points * unitPeriod / 1000);
        });
        multi.exec(callback || log);
    }

    /**
     * get results of the stats
     *
     * @param {String} type sum, min, max, avg, count, uni
     */
    function getStat(type, name, granCode, fromDate, toDate, callback) {
        if(!granCode) throw new Error('granCode is required');
        if(!callback && typeof toDate == 'function') {
            callback = toDate;
            toDate = Date.now();
        }
        var gran = granMap[granCode] || util.getUnitDesc(granCode);
        if(!gran) throw new Error('Granualrity is not defined ' + granCode);
        if(fromDate instanceof Date) fromDate = fromDate.getTime();
        if(toDate instanceof Date) toDate = toDate.getTime();

        toDate = toDate || Date.now()
        fromDate = fromDate || (toDate - util.getTimePeriod(gran, points));

        var unitPeriod = gran[0];
        var multi = redis.multi();
        var _points = [];
        for(var d = fromDate; d <= toDate; d += unitPeriod) {
            var key = getGranKey(name, gran, d);
            _points.push(util.getKeyTime(gran, d));
            multi.hget(key, type);
        }
        multi.exec(function(err, results) {
                if(err) return callback(err);
                var merged = [];
                for (var i = 0, l = _points.length, p; i < l; i ++) {
                    p = _points[i];
                    merged[i] = [p, Number(results[i])];
                }
                callback(null, {
                        step: unitPeriod
                      , unitType: gran[3]
                      , data: merged
                });
        });
    }

    function aggrstat(type, name, aggr, date, callback) {
        if(!callback && typeof date == 'function') {
            callback = date;
            date = Date.now();
        }
        var vals = aggrvals[aggr[0]];
        var multi = redis.multi();
        var gkey = getAggrGruopKey(name, aggr, date);
        for (var i = 0, l = vals.length; i < l; i ++) {
            var key = gkey + '.' + vals[i];
            multi.hget(key, type);
        }
        multi.exec(function(err, results) {
                if(err) return callback(err);
                callback(null, results.map(function(result, i) {
                            return [i, Number(result)]
                }));
        });
    }

    function updateHyperLogLog() {
        redis.hgetall(keyPFKeys, function(err, result) {
                if(err) return log(err);
                var now = Date.now();
                var multi = redis.multi();
                var expireTime, key;
                for(var pfkey in result) {
                    expireTime = Number(result[pfkey]);
                    key = pfkey.substring(0, pfkey.length - 3);
                    evalScript(multi, 'update_pf', [pfkey, key], [])
                    if(expireTime < now) {
                        multi.hdel(keyPFKeys, pfkey);
                        multi.del(pfkey);
                    }
                }
                multi.exec(log);
        });
    }

    var updateTimer = setInterval(updateHyperLogLog, interval);

    function stop() {
        clearInterval(updateTimer);
    }

    return {
        record : record
      , recordUnique: recordUnique
      , stat: getStat // deprecated
      , getStat: getStat
      , aggrstat: aggrstat
      , unique: getStat.bind(null, 'uni')
      , uni: getStat.bind(null, 'uni')
      , sum: getStat.bind(null, 'sum')
      , count: getStat.bind(null, 'count')
      , avg: getStat.bind(null, 'avg')
      , max: getStat.bind(null, 'max')
      , min: getStat.bind(null, 'min')
      , aggrsum: aggrstat.bind(null, 'sum')
      , aggrcount: aggrstat.bind(null, 'count')
      , aggravg: aggrstat.bind(null, 'avg')
      , aggrmax: aggrstat.bind(null, 'max')
      , aggrmin: aggrstat.bind(null, 'min')
      , setValue: setValue
      , getTimePeriod: util.getTimePeriod
      , stop: stop
    }
}

exports.getTimePeriod = util.getTimePeriod;
