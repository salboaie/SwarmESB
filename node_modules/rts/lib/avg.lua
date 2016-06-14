local key, num = KEYS[1], KEYS[2]
local avg = redis.call('hget', key, 'avg')
local count = redis.call('hincrby', key, 'count', 1)
if(avg == false) then avg = 0 end
redis.call('hset', key, 'avg', (avg * (count - 1) + num) / count)
