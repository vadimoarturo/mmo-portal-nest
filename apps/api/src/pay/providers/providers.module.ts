import { Module } from '@nestjs/common';
import { PayProvidersFactory } from './providers.factory';
import { FreeKassaService } from './FreeKassa/free-kassa.service';
import { ConfigModule } from '@nestjs/config';
import { AnyPayService } from './AnyPay/any-pay.service';
import { EnotService } from './Enot/enot.service';

@Module({
    imports: [ConfigModule],
    providers: [PayProvidersFactory, FreeKassaService, AnyPayService, EnotService],
    exports: [PayProvidersFactory, FreeKassaService, AnyPayService, EnotService],
})
export class ProvidersModule {}
