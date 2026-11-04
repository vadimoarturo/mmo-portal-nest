import { WalletModule } from '../wallet/wallet.module';
import { Module } from '@nestjs/common';
import { ShopService } from './application/shop.service';
import { PrismaCatalogRepository } from './infrastructure/prisma-catalog.repository';
import { CatalogQueries } from './infrastructure/catalog.queries';
import { ShopController } from './presentation/http/shop.controller';
import { IdentityModule } from '../identity/identity.module';
import { UserService } from '../identity/application/user.service';
import { BalanceService } from '../wallet/application/balance.service';
import { GameGateway } from '../game-integration/infrastructure/game.gateway';
import { PrismaUnitOfWork } from '#Root/platform/prisma/unit-of-work';
@Module({
    imports: [IdentityModule, WalletModule],
    providers: [
        PrismaCatalogRepository,
        CatalogQueries,
        PrismaUnitOfWork,
        {
            provide: ShopService,
            inject: [PrismaCatalogRepository, CatalogQueries, UserService, BalanceService, GameGateway, PrismaUnitOfWork],
            useFactory: (repository: PrismaCatalogRepository, queries: CatalogQueries, accounts: UserService, wallet: BalanceService, game: GameGateway, uow: PrismaUnitOfWork) =>
                new ShopService(repository, queries, accounts, wallet, game, uow),
        },
    ],
    controllers: [ShopController],
    exports: [ShopService],
})
export class ShopModule {}
