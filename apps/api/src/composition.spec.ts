import { Global, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from './platform/prisma/prisma.service';
import { QueueService } from './platform/queue/queue.service';
import { CacheService } from './platform/cache/cache.service';
import { GameGateway } from './contexts/game-integration/infrastructure/game.gateway';
import { GameServerFactory } from './contexts/game-integration/infrastructure/game-server.factory';
import { IdentityModule } from './contexts/identity/identity.module';
import { ShopModule } from './contexts/catalog/shop.module';
import { AuctionModule } from './contexts/auctions/auction.module';
import { PayModule } from './contexts/payments/pay.module';
import { StatsModule } from './contexts/rankings/stats.module';
import { AuthService } from './contexts/identity/application/auth.service';
import { BalanceService } from './contexts/wallet/application/balance.service';
import { ShopService } from './contexts/catalog/application/shop.service';
import { AuctionService } from './contexts/auctions/application/auction.service';
import { SettlePayment } from './contexts/payments/application/settle-payment';
import { Rankings } from './contexts/rankings/application/rankings';

// Compile the real context modules with only external resources replaced.
@Global()
@Module({
    providers: [PrismaService, QueueService, CacheService, GameGateway, GameServerFactory].map((provide) => ({
        provide,
        useValue: provide === CacheService ? { deleteDataCache: jest.fn() } : {},
    })),
    exports: [PrismaService, QueueService, CacheService, GameGateway, GameServerFactory],
})
class TestPlatformModule {}

describe('Context composition roots', () => {
    it('resolves controllers, guards and application factories without live services', async () => {
        const module = await Test.createTestingModule({ imports: [TestPlatformModule, IdentityModule, ShopModule, AuctionModule, PayModule, StatsModule] }).compile();
        for (const service of [AuthService, BalanceService, ShopService, AuctionService, SettlePayment, Rankings]) {
            expect(module.get(service, { strict: false })).toBeInstanceOf(service);
        }
        await module.close();
    });
});
