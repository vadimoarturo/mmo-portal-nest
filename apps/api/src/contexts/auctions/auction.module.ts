import { WalletModule } from '../wallet/wallet.module';
import { Module } from '@nestjs/common';
import { AuctionService } from './application/auction.service';
import { PrismaAuctionRepository } from './infrastructure/prisma-auction.repository';
import { AuctionQueries } from './infrastructure/auction.queries';
import { AuctionController } from './presentation/http/auction.controller';
import { IdentityModule } from '../identity/identity.module';
import { UserService } from '../identity/application/user.service';
import { BalanceService } from '../wallet/application/balance.service';
import { GameGateway } from '../game-integration/infrastructure/game.gateway';
import { PrismaUnitOfWork } from '#Root/platform/prisma/unit-of-work';
@Module({
    imports: [IdentityModule, WalletModule],
    providers: [
        PrismaAuctionRepository,
        AuctionQueries,
        PrismaUnitOfWork,
        {
            provide: AuctionService,
            inject: [PrismaAuctionRepository, AuctionQueries, UserService, BalanceService, GameGateway, PrismaUnitOfWork],
            useFactory: (repository: PrismaAuctionRepository, queries: AuctionQueries, accounts: UserService, wallet: BalanceService, game: GameGateway, uow: PrismaUnitOfWork) =>
                new AuctionService(repository, queries, accounts, wallet, game, uow),
        },
    ],
    controllers: [AuctionController],
    exports: [AuctionService],
})
export class AuctionModule {}
