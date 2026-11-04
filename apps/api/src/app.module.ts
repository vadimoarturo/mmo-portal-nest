import { WalletModule } from './contexts/wallet/wallet.module';
import { ConfigModule } from '#Root/platform/config/config.module';
import { ConfigService } from '#Root/platform/config/config.service';
import { Module } from '@nestjs/common';
import { PlatformModule } from '#Root/bootstrap/platform.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { ShopModule } from '#Root/contexts/catalog/shop.module';
import { IdentityModule } from '#Root/contexts/identity/identity.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StatsModule } from '#Root/contexts/rankings/stats.module';
import { AuctionModule } from '#Root/contexts/auctions/auction.module';
import { PayModule } from '#Root/contexts/payments/pay.module';

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
        PlatformModule,
        ShopModule,
        StatsModule,
        IdentityModule,
        WalletModule,
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
