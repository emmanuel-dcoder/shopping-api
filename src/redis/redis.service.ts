import { envConfig } from '../core/config/env.config';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  async connect(): Promise<void> {
    if (this.client) {
      console.log('Redis client already connected');
      return;
    }
    this.client = new Redis({
      port: Number(envConfig.redis.port),
      host: envConfig.redis.url,
      password: envConfig.redis.password,
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
    });

    // this.client.on('error', (err) => {
    //   console.error('❌ Redis error:', err);
    // });
  }

  async get(key: string): Promise<any> {
    if (!this.client) {
      console.error('Redis client not initialized in get()');
      return null;
    }

    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  async set(key: string, value: any, ttlInSeconds = 3600): Promise<void> {
    if (!this.client) {
      console.error('Redis client not initialized in set()');
      return;
    }

    await this.client.set(key, JSON.stringify(value), 'EX', ttlInSeconds);
  }

  async del(key: string): Promise<void> {
    if (!this.client) {
      console.error(' Redis client not initialized in del()');
      return;
    }

    await this.client.del(key);
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
