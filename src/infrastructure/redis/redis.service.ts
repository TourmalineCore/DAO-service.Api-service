import { Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { configureRedisClient } from './config/configureRedisClient';

@Injectable()
export class RedisService {
  public readonly redisClient: RedisClientType;

  constructor() {
    this.redisClient = configureRedisClient();
  }

  async get<T>(key: string | number): Promise<T> {
    const data = await this.redisClient.get(key.toString());
    return <T>JSON.parse(data);
  }

  async set<T>(
    key: string | number,
    value: T,
    ttlInSeconds?: number,
  ): Promise<void> {
    await this.redisClient.set(key.toString(), JSON.stringify(value));

    if (ttlInSeconds) {
      await this.redisClient.expire(key.toString(), ttlInSeconds);
    }
  }
}
