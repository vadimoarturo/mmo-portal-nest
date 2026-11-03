import { UserModule } from '#User/user.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { CacheService } from '#Core/cache/cache.service';

@Module({
    imports: [UserModule],
    providers: [ShopService],
    controllers: [ShopController],
})
export class ShopModule implements OnModuleInit {
    constructor(private readonly cacheService: CacheService) {}

    async onModuleInit() {
        await this.cacheService.deleteDataCache(ShopService.cacheKeys);
    }

    async onModuleDestroy() {
        await this.cacheService.deleteDataCache(ShopService.cacheKeys);
    }
}
