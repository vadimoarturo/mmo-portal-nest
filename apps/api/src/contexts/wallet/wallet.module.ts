import { IdentityModule } from '../identity/identity.module';
import { WalletController } from './presentation/http/wallet.controller';
import { Module } from '@nestjs/common';
import { BalanceService } from './application/balance.service';
import { PrismaWalletRepository } from './infrastructure/prisma-wallet.repository';
import { PrismaUnitOfWork } from '#Root/platform/prisma/unit-of-work';
@Module({
    imports: [IdentityModule],
    controllers: [WalletController],
    providers: [
        PrismaWalletRepository,
        PrismaUnitOfWork,
        {
            provide: BalanceService,
            inject: [PrismaWalletRepository, PrismaUnitOfWork],
            useFactory: (repository: PrismaWalletRepository, uow: PrismaUnitOfWork) => new BalanceService(repository, uow),
        },
    ],
    exports: [BalanceService],
})
export class WalletModule {}
