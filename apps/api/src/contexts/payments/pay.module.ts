import { WalletModule } from '../wallet/wallet.module';
import { Module } from '@nestjs/common';
import { ProvidersModule } from './infrastructure/providers/providers.module';
import { PrismaPaymentRepository } from './infrastructure/prisma-payment.repository';
import { ProviderPaymentGateway } from './infrastructure/payment.gateway';
import { PayService } from './application/pay.service';
import { SettlePayment } from './application/settle-payment';
import { WebhookService } from './presentation/http/webhook/webhook.service';
import { WebhookController } from './presentation/http/webhook/webhook.controller';
import { PayController } from './presentation/http/pay.controller';
import { IdentityModule } from '../identity/identity.module';
import { BalanceService } from '../wallet/application/balance.service';
import { PrismaUnitOfWork } from '#Root/platform/prisma/unit-of-work';
@Module({
    imports: [ProvidersModule, IdentityModule, WalletModule],
    providers: [
        PrismaPaymentRepository,
        ProviderPaymentGateway,
        PrismaUnitOfWork,
        WebhookService,
        {
            provide: PayService,
            inject: [PrismaPaymentRepository, ProviderPaymentGateway],
            useFactory: (repository: PrismaPaymentRepository, gateway: ProviderPaymentGateway) => new PayService(repository, gateway),
        },
        {
            provide: SettlePayment,
            inject: [PrismaPaymentRepository, BalanceService, PrismaUnitOfWork],
            useFactory: (repository: PrismaPaymentRepository, wallet: BalanceService, uow: PrismaUnitOfWork) => new SettlePayment(repository, wallet, uow),
        },
    ],
    controllers: [PayController, WebhookController],
})
export class PayModule {}
