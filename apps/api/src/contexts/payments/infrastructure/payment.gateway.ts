import { randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PayProvidersFactory } from './providers/providers.factory';
import { PaymentGateway } from '../application/payment.port';
import { PayProviders } from '#Root/shared/domain/enum/index';
@Injectable()
export class ProviderPaymentGateway implements PaymentGateway {
    constructor(private readonly factory: PayProvidersFactory) {}
    nextOrderId() {
        return `${Date.now()}${randomInt(1000000).toString().padStart(6, '0')}`;
    }
    pay(provider: PayProviders, request: Parameters<PaymentGateway['pay']>[1]) {
        return this.factory.getService(provider).pay(request);
    }
}
