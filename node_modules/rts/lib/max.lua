local key, num = KEYS[1], KEYS[2]
local max = redis.call('hget', key, 'max')
if (max == false) or (tonumber(num) > tonumber(max)) then
    redis.call('hset', key, 'max', num)
end
