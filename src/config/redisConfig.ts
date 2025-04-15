import Redis from 'ioredis';

const redis = new Redis(); // or add config if needed

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redis;
