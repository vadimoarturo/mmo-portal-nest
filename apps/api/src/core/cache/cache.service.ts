import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
    private readonly redis: Redis | null;

    constructor(private readonly redisService: RedisService) {
        this.redis = this.redisService.getOrThrow();
    }

    async getDataCache<T>(key: string): Promise<T> {
        const dataCache: string = await this.redis.get(key);
        return JSON.parse(dataCache);
    }

    async setDataCache<T>(data: T, key: string) {
        await this.redis.set(key, JSON.stringify(data));
    }

    async deleteDataCache(keyPattern: string) {
        const keysToDelete = await this.redis.keys(`${keyPattern}*`);
        if (keysToDelete.length > 0) {
            await this.redis.del(...keysToDelete);
        }
    }
}
