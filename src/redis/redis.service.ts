import { envConfig } from '../core/config/env.config';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.client) {
      console.log('Redis client already connected');
      return;
    }

    this.client = new Redis({
      port: Number(envConfig.redis.port),
      host: envConfig.redis.url,
      // password: envConfig.redis.password,
      lazyConnect: true, // prevents auto-connect until .connect() is called
    });

    try {
      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Redis connected successfully');
    } catch (err) {
      console.error('❌ Redis connection failed:', err);
      this.isConnected = false;
    }

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.warn('⚠️ Redis connection closed');
      this.isConnected = false;
    });
  }

  async get(key: string): Promise<any> {
    if (!this.isConnected) return null;
    try {
      const result = await this.client.get(key);
      return result ? JSON.parse(result) : null;
    } catch (err) {
      console.error('Redis GET error:', err);
      return null;
    }
  }

  async set(key: string, value: any, ttlInSeconds = 3600): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlInSeconds);
    } catch (err) {
      console.error('Redis SET error:', err);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Redis DEL error:', err);
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.quit();
    }
  }
}
