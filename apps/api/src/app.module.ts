import { ConfigModule } from '#Core/config/config.module';
import { ConfigService } from '#Core/config/config.service';
import { Module } from '@nestjs/common';
import { CoreModule } from '#Core/core.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { ShopModule } from '#Shop/shop.module';
import { UserModule } from '#User/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StatsModule } from '#Stats/stats.module';
import { AuctionModule } from '#Auction/auction.module';
import { PayModule } from '#Pay/pay.module';

@Module({
    imports: [
        ConfigModule,
        ScheduleModule.forRoot(),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                throttlers: [{ ttl: 60000, limit: 60 }],
                storage: new ThrottlerStorageRedisService({
                    host: config.get('REDIS_HOST'),
                    port: config.get('REDIS_PORT'),
                }),
            }),
        }),
        CoreModule,
        ShopModule,
        StatsModule,
        UserModule,
        AuctionModule,
        PayModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
