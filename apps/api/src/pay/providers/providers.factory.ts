import { ApiError } from '#Common/exception/error.exception';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ErrorCodeClient, PayProviders } from '#Common/enum';
import { FreeKassaService } from './FreeKassa/free-kassa.service';
import { AnyPayService } from './AnyPay/any-pay.service';
import { EnotService } from './Enot/enot.service';

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
                throw new ApiError({
                    type: 'CLIENT',
                    code: ErrorCodeClient.PAY_CREATE_ERROR,
                    message: payProvider,
                });
        }
    }
}
