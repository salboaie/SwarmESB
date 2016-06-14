local key, num = KEYS[1], KEYS[2]
local min = redis.call('hget', key, 'min')
if (min == false) or (tonumber(num) < tonumber(min)) then
    redis.call('hset', key, 'min', num)
end
