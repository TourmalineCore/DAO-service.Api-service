import { createClient, RedisClientType } from 'redis';
import { getRedisConnectionString } from './getRedisConnectionString';

export const configureRedisClient = (): RedisClientType => {
  const redisClient: RedisClientType = createClient({
    url: getRedisConnectionString(),
  });

  redisClient.on('connect', () =>
    console.log(`Successfully connected to Redis`),
  );
  redisClient.on('error', (err) => console.log('Redis client error: ', err));

  redisClient.connect();

  return redisClient;
};
