rts
===

[![Build Status](https://travis-ci.org/guileen/node-rts.png?branch=master)](https://travis-ci.org/guileen/node-rts)

Use redis as time series data store.

* Data for the line chart of a period time, can be use to stat sum/avg/max/min/count of a behavior.

> e.g. Every 5 minutes, sum of user click of the website.

> e.g. Every Day, average consume money of the website.

* Aggregate data of DayOfWeek or HoursOfDay, to analytisic behavior.

> e.g. The sum of click from Monday to SunDay.


## Init

    var rts = require('rts')(options);

    var rts = require('rts')({
            redis: redis,
            gran: '5m, 1h, 1d, 1w',
            points: 500,
            prefix: ''
    });
    
#### Options:

* `redis` the redis client
* `gran`  granularity of recored time. Format is '{number}{unit}, {number}{unit}...'.
    The unit can be `s` second, `m` minute, `h` hour, `d` day, `w` week, `M` month, `y` year.
    e.g. `5m, 1h`, store data for 5 mintues and 1 hour.
* `points` how many data will be keep. We care about recently `n` points of data for each granularity.
    Think about `1s` data, if store 1 day data, it is 86400 rows data,
    we should reduce it to `5m` data, it is only 288 rows. We just care small granularity data for recently, 
    for the history, we just care large granualrity, like revenue of `2010-11`, not revenue of `2010-11-05 12 o'clock`.
* `prefix` the redis key prefix.


## Record

#### record(behavior, \[behaviorValue\], \[statistics\], \[aggregations\])

* `behavior`
* `behaviorValue`
* `statistics`: Array of statistic type, avariable member of `sum`, `count`, `avg`, `max`, `min`. default [`sum`].
* `aggragations`
  * `hm` hour of day, splite data every month
  * `hq` hour of day, splite data every season
  * `hy` hour of day, splite data every year
  * `dm` day of week, splite data every month.
  * `dq` day of week, splite data every season
  * `dy` day of week, splite data every year

```js
ts.record('click') // recore a click
ts.record('consume', 5, null, ['hm', 'dq']) // recored behavior with value, and aggragation. 
ts.record('delay', 100, ['avg','max','min'])
```

## Query
#### ts.getStat(statistic, behavior, granularity, fromDate, toDate, callback)
#### ts\[statistic\](behavior, granularity, fromDate, toDate, callback)
#### ts.aggr{statistic}(behavior, aggragation, date, callback)
* `statistic`  `sum`, `avg`, `count`, `max`, `min`. Must be a member when statistics when `record`!
* `behavior`
* `granularity` The time unit, see `Options`, Must be a part of `options.gran`
* `fromDate`
* `toDate`

```js
ts.sum('click', '5m', fromDate, \[toDate\], callback)
ts.count('delay', '5m', fromDate, \[toDate\], callback)
ts.avg('delay', '5m', fromDate, \[toDate\], callback)
ts.max('delay', '5m', fromDate, \[toDate\], callback)
ts.min('delay', '5m', fromDate, \[toDate\], callback)

ts.aggravg('click', 'hm', date, callback)
```

## Others

#### ts.setValue(name, stat, value, gran, timestamp, callback)
#### ts.getTimePeriord(gran, points)
