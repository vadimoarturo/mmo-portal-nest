import { Module } from '@nestjs/common';
import { PayProvidersFactory } from '#Root/contexts/payments/infrastructure/providers/providers.factory';
import { FreeKassaService } from '#Root/contexts/payments/infrastructure/providers/FreeKassa/free-kassa.service';
import { ConfigModule } from '@nestjs/config';
import { AnyPayService } from '#Root/contexts/payments/infrastructure/providers/AnyPay/any-pay.service';
import { EnotService } from '#Root/contexts/payments/infrastructure/providers/Enot/enot.service';

@Module({
    imports: [ConfigModule],
    providers: [PayProvidersFactory, FreeKassaService, AnyPayService, EnotService],
    exports: [PayProvidersFactory, FreeKassaService, AnyPayService, EnotService],
})
export class ProvidersModule {}
