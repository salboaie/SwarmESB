local pfkey, key = KEYS[1], KEYS[2]

local count = redis.call('pfcount', pfkey)
if(count)then
    redis.call('hset', key, 'uni', count)
end
