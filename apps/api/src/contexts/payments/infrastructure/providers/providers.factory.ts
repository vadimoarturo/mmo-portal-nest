import { DomainError } from '#Root/shared/domain/domain-error';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ErrorCodeClient, PayProviders } from '#Root/shared/domain/enum/index';
import { FreeKassaService } from '#Root/contexts/payments/infrastructure/providers/FreeKassa/free-kassa.service';
import { AnyPayService } from '#Root/contexts/payments/infrastructure/providers/AnyPay/any-pay.service';
import { EnotService } from '#Root/contexts/payments/infrastructure/providers/Enot/enot.service';

@Injectable()
export class PayProvidersFactory {
    constructor(private readonly moduleRef: ModuleRef) {}

    getService(payProvider: PayProviders): FreeKassaService | AnyPayService | EnotService {
        switch (payProvider) {
            case PayProviders.FREEKASSA:
                return this.moduleRef.get(FreeKassaService, { strict: false });
            case PayProviders.ANYPAY:
                return this.moduleRef.get(AnyPayService, { strict: false });
            case PayProviders.ENOT:
                return this.moduleRef.get(EnotService, { strict: false });
            default:
                throw new DomainError({
                    type: 'CLIENT',
                    code: ErrorCodeClient.PAY_CREATE_ERROR,
                    message: payProvider,
                });
        }
    }
}
