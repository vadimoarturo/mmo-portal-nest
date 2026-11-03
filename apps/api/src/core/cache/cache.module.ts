import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CacheService } from './cache.service';

@Module({
    imports: [
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                config: { host: config.get('REDIS_HOST'), port: config.get('REDIS_PORT') },
            }),
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule {}
